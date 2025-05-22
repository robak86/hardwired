import { describe, expect, vi } from 'vitest';

import { container } from '../Container.js';
import { cascading, scoped, singleton } from '../../definitions/def-symbol.js';
import type { AsyncContainerConfigureFn, ContainerConfigureFn } from '../../configuration/ContainerConfiguration.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';
import type { IContainer } from '../IContainer.js';

describe(`container#[Symbol.dispose]`, () => {
  class DisposableImpl {
    constructor(private _disposeFn: (...args: any[]) => unknown) {}

    [Symbol.dispose]() {
      this._disposeFn();
    }

    dispose() {
      this._disposeFn();
    }
  }

  describe(`disposable objects`, () => {
    describe(`scoped`, () => {
      it(`can be disposed only from the owning scope`, async () => {
        const disposeSpy = vi.fn();
        const def = scoped<DisposableImpl>();

        const cnt = container.new(c => {
          c.add(def).fn(() => new DisposableImpl(disposeSpy));
        });

        const scope = cnt.scope();
        const siblingScope = cnt.scope();

        await scope.use(def);

        siblingScope.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(0);

        scope.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(1);
      });

      it(`doesn't dispose scoped instance cascaded from the parent scope`, async () => {
        const disposeSpy = vi.fn();
        const def = cascading<DisposableImpl>();

        const cnt = container.new(c => {
          c.add(def).fn(() => new DisposableImpl(disposeSpy));
        });

        const scope1 = cnt.scope(s => {
          s.modify(def).cascade();
        });

        const scope2 = scope1.scope();

        await scope2.use(def);

        scope2.dispose();
        // we tried to dispose from scope2, but also scope1 references the same instance
        expect(disposeSpy).toHaveBeenCalledTimes(0);

        scope1.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe(`singletons`, () => {
      it(`can be disposed only from the root scope`, async () => {
        const disposeSpy = vi.fn();
        const def = singleton<DisposableImpl>();

        const cnt = container.new(c => {
          c.add(def).fn(() => new DisposableImpl(disposeSpy));
        });

        const scope = cnt.scope();

        await scope.use(def);

        scope.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(0);

        cnt.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('custom dispose callbacks', () => {
    it(`it's called correctly`, async () => {
      const disposeSpy = vi.fn();

      const def = singleton<DisposableImpl>();

      const cnt = container.new(c => {
        c.add(def).fn(() => new DisposableImpl(disposeSpy));
      });

      const scope = cnt.scope(s => {
        s.onDispose(use => {
          use.useExisting(def)?.dispose();
        });
      });

      await scope.use(def);
      scope.dispose();

      expect(disposeSpy).toHaveBeenCalledTimes(1);
    });

    describe(`dispose`, () => {
      it(`doesn't dispose scope twice`, async () => {
        const rootDispose = vi.fn();
        const scopeDispose = vi.fn();

        const cnt = container.new(c => {
          c.onDispose(rootDispose);
        });

        const scope = cnt.scope(c => {
          c.onDispose(scopeDispose);
        });

        cnt.dispose();
        cnt.dispose();

        expect(rootDispose).toHaveBeenCalledTimes(1);
        expect(scopeDispose).toHaveBeenCalledTimes(0);

        scope.dispose();
        scope.dispose();

        expect(scopeDispose).toHaveBeenCalledTimes(1);
      });

      it(`throws when container is used after manual disposal`, async () => {
        const def = singleton<number>();

        const cnt = container.new(c => c.add(def).static(1));

        cnt.dispose();

        await expect(async () => {
          await cnt.use(def);
        }).rejects.toThrowError();
      });
    });
  });

  describe(`integration with vitest`, () => {
    const status = {
      isDisposed: false,
      customDisposeCalled: false,
    };

    const dbConnection = cascading<Disposable>();

    const withContainer = <TConfigureFns extends Array<AsyncContainerConfigureFn | ContainerConfigureFn>>(
      ...containerConfigFns: TConfigureFns
    ) => {
      return test.extend<{ use: IContainer }>({
        use: async ({}, use) => {
          const scope = await container.new(...containerConfigFns);

          await use(scope);

          scope.dispose();
        },
      });
    };

    const setupDB = configureContainer(c => {
      c.add(dbConnection).fn(() => {
        return {
          [Symbol.dispose]() {
            status.isDisposed = true;
          },
        };
      });

      c.onDispose(() => {
        status.customDisposeCalled = true;
      });
    });

    const it = withContainer(setupDB);

    it(`uses container`, async ({ use }) => {
      const scope = use.scope();

      await scope.use(dbConnection);
    });

    it(`has cleaned resources from the previous run`, async () => {
      expect(status.isDisposed).toBe(true);
      expect(status.customDisposeCalled).toBe(true);
    });
  });
});
