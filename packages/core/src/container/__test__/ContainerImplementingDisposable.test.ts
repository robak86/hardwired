import { describe, expect, test, vi } from 'vitest';

import { container } from '../Container.js';
import { fn } from '../../definitions/fn.js';
import {
  type AsyncContainerConfigureFn,
  configureContainer,
  type ContainerConfigureFn,
} from '../../configuration/ContainerConfiguration.js';
import type { IContainer } from '../IContainer.js';

describe(`container#[Symbol.dispose]`, () => {
  class Disposable {
    constructor(private _disposeFn: (...args: any[]) => unknown) {}

    [Symbol.dispose]() {
      this._disposeFn();
    }
  }

  describe(`disposable objects`, () => {
    describe(`scoped`, () => {
      it(`can be disposed only from the owning scope`, async () => {
        const disposeSpy = vi.fn();
        const def = fn.scoped(() => new Disposable(disposeSpy));
        const cnt = container.new();

        const scope = cnt.scope();
        const siblingScope = cnt.scope();

        scope.use(def);

        siblingScope.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(0);

        scope.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(1);
      });

      it(`doesn't dispose scoped instance cascaded from the parent scope`, async () => {
        const disposeSpy = vi.fn();
        const def = fn.scoped(() => new Disposable(disposeSpy));
        const cnt = container.new();

        const scope1 = cnt.scope(s => {
          s.cascade(def);
        });

        const scope2 = scope1.scope();

        scope2.use(def);
        scope2.dispose();

        expect(disposeSpy).toHaveBeenCalledTimes(0);

        scope1.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe(`singletons`, () => {
      it(`can be disposed only from the root scope`, async () => {
        const disposeSpy = vi.fn();

        const def = fn.singleton(() => new Disposable(disposeSpy));

        const cnt = container.new();
        const scope = cnt.scope();

        scope.use(def);

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
      const def = fn.singleton(() => ({
        dispose: disposeSpy,
      }));

      const cnt = container.new();

      const scope = cnt.scope(s => {
        s.onDispose(use => {
          use.useExisting(def)?.dispose();
        });
      });

      scope.use(def);
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
        const def = fn.singleton(() => 123);

        const cnt = container.new();

        cnt.dispose();

        expect(() => {
          cnt.use(def);
        }).toThrowError();
      });
    });
  });

  describe(`integration with vitest`, () => {
    const status = {
      isDisposed: false,
      customDisposeCalled: false,
    };

    const dbConnection = fn.scoped(() => {
      return {
        [Symbol.dispose]() {
          status.isDisposed = true;
        },
      };
    });

    const withContainer = <TConfigureFns extends Array<AsyncContainerConfigureFn | ContainerConfigureFn>>(
      ...containerConfigFns: TConfigureFns
    ) => {
      return test.extend<{ use: IContainer }>({
        // eslint-disable-next-line no-empty-pattern
        use: async ({}, use) => {
          const scope = await container.new(...containerConfigFns);

          await use(scope);

          scope.dispose();
        },
      });
    };

    const setupDB = configureContainer(c => {
      c.cascade(dbConnection);

      c.onDispose(() => {
        status.customDisposeCalled = true;
      });
    });

    const it = withContainer(setupDB);

    it(`uses container`, async ({ use }) => {
      const scope = use.scope();

      scope.use(dbConnection);
    });

    it(`has cleaned resources from the previous run`, async () => {
      expect(status.isDisposed).toBe(true);
      expect(status.customDisposeCalled).toBe(true);
    });
  });
});
