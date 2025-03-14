import { afterEach, vi } from 'vitest';

import { container } from '../Container.js';
import { fn } from '../../definitions/definitions.js';
import { runGC } from '../../utils/__test__/runGC.js';

import { withContainer } from './withContainer.js';

describe(`registering scopes`, () => {
  class Disposable {
    constructor(private _disposeFn: (...args: any[]) => unknown) {}

    [Symbol.dispose]() {
      this._disposeFn();
    }
  }

  describe(`rootContainer`, () => {
    describe(`scoped`, () => {
      it(`disposes scoped instances`, async () => {
        const disposeSpy = vi.fn<[string]>();
        const scoped1 = fn.scoped(() => new Disposable(disposeSpy));

        function main() {
          const cnt = container.new();

          cnt.use(scoped1);
        }

        main();

        await runGC();

        await vi.waitFor(() => {
          expect(disposeSpy).toHaveBeenCalled();
        });
      });
    });

    describe(`singletons`, () => {
      describe(`instance was created`, () => {
        it(`disposes root container disposables when it is garbage collected`, async () => {
          const disposeSpy = vi.fn<[string]>();
          const singleton1 = fn.singleton(() => new Disposable(disposeSpy));

          function main() {
            const cnt = container.new();

            cnt.use(singleton1);
          }

          main();

          await runGC();

          expect(disposeSpy).toHaveBeenCalled();
        });

        it(`doesn't dispatch dispose twice `, async () => {
          const disposeSpy = vi.fn<[string]>();
          const singleton1 = fn.singleton(() => new Disposable(disposeSpy));

          function main() {
            const cnt = container.new();

            const scope = cnt.scope();

            scope.use(singleton1);
            cnt.use(singleton1);
          }

          main();

          await runGC();

          expect(disposeSpy).toHaveBeenCalledTimes(1);
        });

        it(`dispatch dispose if singleton was propagated from the child scope`, async () => {
          const disposeSpy = vi.fn<[string]>();
          const singleton1 = fn.singleton(() => new Disposable(disposeSpy));

          function main() {
            const cnt = container.new();

            const scope = cnt.scope();

            scope.use(singleton1);
          }

          main();

          await runGC();

          expect(disposeSpy).toHaveBeenCalledTimes(1);
        });

        it(`disposes multiple definitions`, async () => {
          const disposeSpy = vi.fn<[string]>();

          const singleton1 = fn.singleton(() => new Disposable(disposeSpy));
          const singleton2 = fn.singleton(async () => new Disposable(disposeSpy));

          async function main() {
            const cnt = container.new();

            cnt.use(singleton1);
            await cnt.use(singleton2);
          }

          await main();

          await runGC();

          await vi.waitFor(() => {
            expect(disposeSpy).toHaveBeenCalledTimes(2);
          });
        });

        it(`doesn't crash when dispose throws`, async () => {
          const disposeSpy = vi.fn<[string]>(() => {
            throw new Error('dispose error');
          });

          const singleton1 = fn.singleton(() => new Disposable(disposeSpy));

          function main() {
            const cnt = container.new();

            cnt.use(singleton1);
          }

          main();

          await runGC();

          expect(disposeSpy).toHaveBeenCalled();
        });

        it(`doesn't create mem leaks`, async () => {
          const created: number[] = [];
          const disposed: number[] = [];

          const sideEffectDef = fn.singleton(() => {
            const val = Math.random();

            created.push(val);

            return new Disposable(() => {
              disposed.push(val);
            });
          });

          function main() {
            const cnt = container.new();

            cnt.use(sideEffectDef);
          }

          const count = 5;

          for (let i = 0; i < count; i++) {
            main();
          }

          expect(created).toHaveLength(count);
          expect(disposed).toHaveLength(0);

          await runGC();

          expect(created).toHaveLength(count);

          await vi.waitFor(() => {
            expect(disposed).toHaveLength(count);
          });
        });
      });
    });
  });

  describe(`scopes`, () => {
    describe(`scoped`, () => {
      it(`disposes scoped instances`, async () => {
        const disposeSpy = vi.fn<[string]>();

        const scoped1 = fn.scoped(() => new Disposable(disposeSpy));
        const cnt = container.new();

        function main() {
          const scope = cnt.scope();

          scope.use(scoped1);
        }

        main();

        await runGC();

        await vi.waitFor(() => {
          expect(disposeSpy).toHaveBeenCalled();
        });
      });

      it(`correctly disposes nested scopes`, async () => {
        const disposeSpy = vi.fn<[string]>();
        const scoped1 = fn.scoped(() => new Disposable(disposeSpy));

        const cnt = container.new();

        function main() {
          const scope1 = cnt.scope();

          const scope2 = scope1.scope();

          scope1.use(scoped1);
          scope2.use(scoped1);
        }

        main();

        await runGC();

        await vi.waitFor(() => {
          expect(disposeSpy).toHaveBeenCalledTimes(2);
        });
      });

      it(`does not dispose cascading scoped definition`, async () => {
        const disposeSpy = vi.fn<[string]>();
        const scoped1 = fn.scoped(() => new Disposable(disposeSpy));

        const cnt = container.new();

        const scope1 = cnt.scope(c => {
          c.cascade(scoped1);
        });

        function main() {
          const scope2 = scope1.scope();

          const val1 = scope1.use(scoped1);
          const val2 = scope2.use(scoped1);

          expect(val1).toBe(val2);
        }

        main();

        await runGC();

        await vi.waitFor(() => {
          expect(disposeSpy).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe.skip(`integration with vitest`, () => {
    const it = withContainer();

    const status = {
      isDisposed: false,
    };

    afterEach(async () => {
      await runGC();

      await vi.waitFor(
        () => {
          expect(status.isDisposed).toEqual(true);
        },
        {
          timeout: 1000,
        },
      );
    });

    it(`provides instance of container`, async ({ use }) => {
      const def = fn.singleton(() => {
        return new Disposable(() => {
          console.log('WTTTTTTTF');

          status.isDisposed = true;
        });
      });

      use(def);
    });
  });
});
