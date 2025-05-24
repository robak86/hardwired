import { describe, expect, vi } from 'vitest';

import { container } from '../Container.js';
import { cascading, scoped, singleton, transient } from '../../definitions/def-symbol.js';
import type { ContainerConfigureFn } from '../../configuration/ContainerConfiguration.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';
import type { IContainer } from '../IContainer.js';
import type { IConfiguration } from '../../configuration/dsl/new/container/ContainerConfiguration.js';
import { configureScope } from '../../configuration/ScopeConfiguration.js';

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

        await siblingScope.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(0);

        await scope.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(1);
      });

      it(`doesn't dispose scoped instance cascaded from the parent scope`, async () => {
        const disposeSpy = vi.fn();
        const def = cascading<DisposableImpl>();

        const cnt = container.new(c => {
          c.add(def).fn(() => new DisposableImpl(disposeSpy));
        });

        const scope1 = cnt.scope(s => {
          s.modify(def).claimNew();
        });

        const scope2 = scope1.scope();

        await scope2.use(def);

        await scope2.dispose();
        // we tried to dispose from scope2, but also scope1 references the same instance
        expect(disposeSpy).toHaveBeenCalledTimes(0);

        await scope1.dispose();
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

        await scope.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(0);

        await cnt.dispose();
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
          use.useExisting(def).then(existing => existing?.dispose());
        });
      });

      await scope.use(def);
      await scope.dispose();

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

        await cnt.dispose();
        await cnt.dispose();

        expect(rootDispose).toHaveBeenCalledTimes(1);
        expect(scopeDispose).toHaveBeenCalledTimes(0);

        await scope.dispose();
        await scope.dispose();

        expect(scopeDispose).toHaveBeenCalledTimes(1);
      });

      it(`throws when container is used after manual disposal`, async () => {
        const def = singleton<number>();

        const cnt = container.new(c => c.add(def).static(1));

        await cnt.dispose();

        await expect(async () => {
          await cnt.use(def);
        }).rejects.toThrowError();
      });
    });
  });

  describe(`onDispose finalizer`, () => {
    const singletonDef = singleton<number>();
    const cascadingDef = cascading<number>();
    const scopedDef = scoped<number>();
    const transientDef = transient<number>();

    describe(`scope configuration`, () => {
      describe(`types`, () => {
        it(`only allows registering callbacks for scoped and cascading definitions `, async () => {
          configureScope(c => {
            c.add(cascadingDef)
              .fn(() => 1)
              .onDispose(_val => {});

            c.add(scopedDef)
              .fn(() => 1)
              .onDispose(_val => {});

            expect(() => {
              c.add(transientDef)
                .fn(() => 1)
                // @ts-expect-error - onDispose is not available for transient definitions
                .onDispose(_val => {});
            }).toThrowError();
          });
        });
      });

      describe(`evaluation`, () => {
        it(`calls onDispose with instance if it exists`, async () => {
          const scopedSpy = vi.fn();
          const cascadingSpy = vi.fn();

          const config = configureScope(c => {
            c.add(cascadingDef)
              .fn(() => 2)
              .onDispose(cascadingSpy);

            c.add(scopedDef)
              .fn(() => 3)
              .onDispose(scopedSpy);
          });

          const cnt = container.new();

          const scope = cnt.scope(config);

          await scope.all(cascadingDef, scopedDef);

          await scope.dispose();

          expect(cascadingSpy).toHaveBeenCalledTimes(1);
          expect(cascadingSpy).toHaveBeenCalledWith(2);

          expect(scopedSpy).toHaveBeenCalledTimes(1);
          expect(scopedSpy).toHaveBeenCalledWith(3);
        });

        it(`supports async dispose fn`, async () => {
          let disposed = false;

          const config = configureScope(c => {
            c.add(cascadingDef)
              .fn(() => 2)
              .onDisposeAsync(async instance => {
                await new Promise(resolve => setTimeout(resolve, 100));
                disposed = true;
              });
          });

          const cnt = container.new(config);

          await cnt.use(cascadingDef);

          expect(disposed).toBe(false);

          await cnt.dispose();
          expect(disposed).toBe(true);
        });

        // TODO: add container configuration like .onDisposeError()
        it(`catches all errors related to disposal`, async () => {
          const config = configureScope(c => {
            c.add(cascadingDef)
              .fn(() => 2)
              .onDispose(() => {
                throw new Error('error');
              });
          });

          const cnt = container.new(config);

          await cnt.use(cascadingDef);

          expect(() => cnt.dispose()).not.toThrowError();
        });

        it(`doesn't call instance if the scope doesn't have instance created`, async () => {
          const scopedSpy = vi.fn();
          const cascadingSpy = vi.fn();

          const config = configureScope(c => {
            c.add(cascadingDef)
              .fn(() => 2)
              .onDispose(cascadingSpy);

            c.add(scopedDef)
              .fn(() => 3)
              .onDispose(scopedSpy);
          });

          const cnt = container.new();
          const scope = cnt.scope(config);

          await scope.dispose();

          expect(cascadingSpy).toHaveBeenCalledTimes(0);
          expect(scopedSpy).toHaveBeenCalledTimes(0);
        });
      });
    });

    describe(`container configuration`, () => {
      describe(`types`, () => {
        it(`allows registering onDispose for all definitions except for transient`, async () => {
          configureContainer(c => {
            c.add(singletonDef)
              .fn(() => 1)
              .onDispose(_val => {});

            c.add(cascadingDef)
              .fn(() => 1)
              .onDispose(_val => {});

            c.add(scopedDef)
              .fn(() => 1)
              .onDispose(_val => {});

            expect(() => {
              c.add(transientDef)
                .fn(() => 1)
                // @ts-expect-error - onDispose is not available for transient definitions
                .onDispose(_val => {});
            }).toThrowError();
          });
        });
      });

      describe(`evaluation`, () => {
        it(`calls onDispose with instance if exist`, async () => {
          const singletonSpy = vi.fn();
          const scopedSpy = vi.fn();
          const cascadingSpy = vi.fn();

          const config = configureContainer(c => {
            c.add(singletonDef)
              .fn(() => 1)
              .onDispose(singletonSpy);

            c.add(cascadingDef)
              .fn(() => 2)
              .onDispose(cascadingSpy);

            c.add(scopedDef)
              .fn(() => 3)
              .onDispose(scopedSpy);
          });

          const cnt = container.new(config);

          await cnt.all(singletonDef, cascadingDef, scopedDef);

          await cnt.dispose();

          await new Promise(resolve => setTimeout(resolve, 100));

          expect(singletonSpy).toHaveBeenCalledTimes(1);
          expect(singletonSpy).toHaveBeenCalledWith(1);

          expect(cascadingSpy).toHaveBeenCalledTimes(1);
          expect(cascadingSpy).toHaveBeenCalledWith(2);

          expect(scopedSpy).toHaveBeenCalledTimes(1);
          expect(scopedSpy).toHaveBeenCalledWith(3);
        });

        it(`doesn't call onDispose if container doesn't have instance of definition`, async () => {
          const singletonSpy = vi.fn();
          const scopedSpy = vi.fn();
          const cascadingSpy = vi.fn();

          const config = configureContainer(c => {
            c.add(singletonDef)
              .fn(() => 1)
              .onDispose(singletonSpy);

            c.add(cascadingDef)
              .fn(() => 2)
              .onDispose(cascadingSpy);

            c.add(scopedDef)
              .fn(() => 3)
              .onDispose(scopedSpy);
          });

          const cnt = container.new(config);

          await cnt.dispose();

          expect(singletonSpy).toHaveBeenCalledTimes(0);
          expect(cascadingSpy).toHaveBeenCalledTimes(0);
          expect(scopedSpy).toHaveBeenCalledTimes(0);
        });
      });
    });
  });

  describe(`integration with vitest`, () => {
    const status = {
      isDisposed: false,
      customDisposeCalled: false,
    };

    const dbConnection = cascading<Disposable>();

    const withContainer = <TConfigureFns extends Array<ContainerConfigureFn | IConfiguration>>(
      ...containerConfigFns: TConfigureFns
    ) => {
      return test.extend<{ use: IContainer }>({
        use: async ({}, use) => {
          const scope = container.new(...containerConfigFns);

          await use(scope);

          await scope.dispose();
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
