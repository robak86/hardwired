import { vi } from 'vitest';

import { container } from '../Container.js';
import { fn } from '../../definitions/fn.js';
import { runGC } from '../../utils/__test__/runGC.js';

describe(`registering scopes`, () => {
  class Disposable {
    constructor(private _disposeFn: (...args: any[]) => unknown) {}

    [Symbol.dispose]() {
      this._disposeFn();
    }
  }

  // describe(`explicit disposal`, () => {
  //   it(`allows instances Store to be garbage collected, so te dispose methods should be called`, async () => {
  //     const disposeSpy = vi.fn<[string]>();
  //     const singleton1 = fn.singleton(() => new Disposable(disposeSpy));
  //     const scoped = fn.scoped(() => new Disposable(disposeSpy));
  //
  //     const cnt = container.new();
  //     const scope = cnt.scope();
  //
  //     scope.use(scoped);
  //     scope.dispose();
  //
  //     cnt.use(singleton1);
  //     cnt.dispose();
  //
  //     await vi.waitFor(() => {
  //       expect(disposeSpy).toHaveBeenCalled();
  //     });
  //   });
  // });

  describe(`rootContainer`, () => {
    describe(`scoped`, { timeout: 20_000 }, () => {
      it(`disposes scoped instances`, async () => {
        const disposeSpy = vi.fn<[string]>();
        const scoped1 = fn.scoped(() => new Disposable(disposeSpy));

        function main() {
          const cnt = container.new();

          cnt.use(scoped1);
        }

        main();

        await runGC();

        await vi.waitFor(
          () => {
            expect(disposeSpy).toHaveBeenCalled();
          },
          {
            timeout: 10_000,
          },
        );
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

          await vi.waitFor(() => {
            expect(disposeSpy).toHaveBeenCalledTimes(1);
          });
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
  //
  describe(`transient`, () => {
    it(`disposes scoped instances`, async () => {
      const disposeSpy = vi.fn<[string]>();
      const transient = fn(() => new Disposable(disposeSpy));

      function main() {
        const cnt = container.new();

        cnt.use(transient);
      }

      main();

      await runGC();

      await vi.waitFor(() => {
        expect(disposeSpy).toHaveBeenCalled();
      });
    });
  });

  describe(`scopes`, () => {
    describe(`scoped`, () => {
      it(`disposes scoped instances`, { timeout: 20_000 }, async () => {
        const disposeSpy = vi.fn<[string]>();

        const scoped1 = fn.scoped(() => new Disposable(disposeSpy));
        const cnt = container.new();

        function main() {
          const scope = cnt.scope();

          scope.use(scoped1);
        }

        main();

        await runGC();

        await vi.waitFor(
          () => {
            expect(disposeSpy).toHaveBeenCalled();
          },
          {
            timeout: 20_000,
          },
        );
      });

      it(`correctly disposes nested scopes`, { timeout: 20_000 }, async () => {
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

        await vi.waitFor(
          () => {
            expect(cnt.stats.childScopes).toEqual(0);
          },
          {
            timeout: 20_000,
          },
        );

        // await vi.waitFor(
        //   () => {
        //     expect(disposeSpy).toHaveBeenCalledTimes(2);
        //   },
        //   {
        //     timeout: 10_000,
        //   },
        // );
      });

      it(`does not dispose cascading scoped definition`, async () => {
        const disposeSpy = vi.fn<[string]>();
        const scoped1 = fn.scoped(() => new Disposable(disposeSpy));

        const cnt = container.new();

        // defined outside the main function. It won't be garbage collected when we define assertion,
        // hence disposeSpy won't be called
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
          expect(disposeSpy).toHaveBeenCalledTimes(0);
        });
      });
    });
  });
  //
});
