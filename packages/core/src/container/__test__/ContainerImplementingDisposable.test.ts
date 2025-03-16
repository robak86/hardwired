import { describe, expect, type MockInstance, vi } from 'vitest';

import { container } from '../Container.js';
import { runGC } from '../../utils/__test__/runGC.js';
import { fn } from '../../definitions/fn.js';

describe(`registering scopes`, () => {
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

        siblingScope[Symbol.dispose]();
        expect(disposeSpy).toHaveBeenCalledTimes(0);

        scope[Symbol.dispose]();
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

        scope[Symbol.dispose]();
        expect(disposeSpy).toHaveBeenCalledTimes(0);

        cnt[Symbol.dispose]();
        expect(disposeSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('custom dispose callbacks', () => {
    it(`works with using, when callback references container`, async () => {
      const disposeSpy = vi.fn();
      const def = fn.singleton(() => ({
        dispose: disposeSpy,
      }));

      const cnt = container.new();

      function inner() {
        using scope = cnt.scope(s => {
          s.onDispose(use => {
            use.useExisting(def)?.dispose();
          });
        });

        scope.use(def);
      }

      inner();

      expect(disposeSpy).toHaveBeenCalledTimes(1);
    });

    describe(`scopes hierarchy`, { timeout: 50_000 }, () => {
      it(`keeps weak references so child scopes can be garbage collected`, async () => {
        const cnt = container.new();

        function main() {
          for (let i = 0; i < 100; i++) {
            cnt.scope();
          }
        }

        main();

        expect(cnt.stats.childScopes).toEqual(100);

        await vi.waitFor(
          async () => {
            await runGC();
            expect(cnt.stats.childScopes).toEqual(0);
          },
          {
            timeout: 50_000,
          },
        );
      });

      it(`allows garbage collection of children even if the scope has some scoped instances memoized `, async () => {
        const cnt = container.new();
        const scopedDef = fn.scoped(() => {
          return new Disposable(() => {
            console.log('disposed');
          });
        });

        function main() {
          for (let i = 0; i < 100; i++) {
            cnt.scope().use(scopedDef);
          }
        }

        main();

        expect(cnt.stats.childScopes).toEqual(100);

        await vi.waitFor(
          async () => {
            await runGC();
            expect(cnt.stats.childScopes).toEqual(0);
          },
          {
            timeout: 50_000,
          },
        );
      });
    });

    describe(`dispose`, () => {
      it(`doesn't dispose scope twice`, async () => {
        const rootDispose = vi.fn();
        const scopeDispose = vi.fn();

        const cnt = container.new(c => {
          c.onDispose(rootDispose);
        });

        cnt.scope(c => {
          c.onDispose(scopeDispose);
        });

        cnt[Symbol.dispose]();
        cnt[Symbol.dispose]();

        expect(rootDispose).toHaveBeenCalledTimes(1);
        expect(scopeDispose).toHaveBeenCalledTimes(1);
      });

      it(`doesn't dispose child scope if it was previously garbage collected`, async () => {
        const someDef = fn.singleton(() => 123);

        const scopeDispose = vi.fn();
        const rootDispose = vi.fn();

        async function main() {
          using cnt = container.new(c => {
            c.onDispose(use => {
              rootDispose(use);
            });
          });

          async function inner() {
            using scope = cnt.scope(s => {
              s.onDispose(use => {
                scopeDispose(use);
              });
            });

            scope.use(someDef);
          }

          await inner();
        }

        await main();

        expect(scopeDispose).toHaveBeenCalledTimes(1);
        expect(rootDispose).toHaveBeenCalledTimes(1);
      });

      it(`works with using`, async () => {
        const someDef = fn.singleton(() => 123);

        const scopeDispose = vi.fn();
        const rootDispose = vi.fn();

        function main() {
          using cnt = container.new(c => {
            c.onDispose(use => {
              rootDispose(use);
            });
          });

          using scope = cnt.scope(s => {
            s.onDispose(use => {
              scopeDispose(use);
            });
          });

          scope.use(someDef);
        }

        main();

        expect(scopeDispose).toHaveBeenCalledTimes(1);
        expect(rootDispose).toHaveBeenCalledTimes(1);
      });

      it(`calls recursively dispose`, async () => {
        const scopeDispose = vi.fn();
        const rootDispose = vi.fn();

        const cnt = container.new(c => {
          c.onDispose(use => {
            rootDispose(use);
          });
        });

        const scope = cnt.scope(s => {
          s.onDispose(use => {
            scopeDispose(use);
          });
        });

        scope[Symbol.dispose]();
        expect(scopeDispose).toHaveBeenCalledWith(scope);

        cnt[Symbol.dispose]();
        expect(rootDispose).toHaveBeenCalledWith(cnt);
      });

      it(`recursively calls dispose on child containers`, { timeout: 50_000 }, async () => {
        const cnt = container.new();
        const scopeSpies: MockInstance<[], void>[] = [];

        function main() {
          for (let i = 0; i < 100; i++) {
            cnt.scope(s => {
              const disposeSpy = vi.fn();

              scopeSpies.push(disposeSpy);

              s.onDispose(() => {
                disposeSpy();
              });
            });
          }
        }

        main();

        expect(cnt.stats.childScopes).toEqual(100);
        expect(scopeSpies.length).toEqual(100);

        cnt[Symbol.dispose]();

        await vi.waitFor(
          async () => {
            scopeSpies.forEach(spy => expect(spy).toHaveBeenCalled());
          },
          {
            timeout: 50_000,
          },
        );
      });
    });
  });

  describe(`integration`, () => {
    describe(`stress test`, () => {
      it(`doesn't skip any disposal`, async () => {
        const runCount = 1_000;

        let count = 0;

        class TestDisposable {
          constructor() {
            count += 1;
          }

          [Symbol.dispose]() {
            count -= 1;
          }
        }

        const singletonD = fn.scoped(() => new TestDisposable());
        const transientD = fn(() => new TestDisposable());
        const scopedD = fn.scoped(() => new TestDisposable());

        function main() {
          using cnt = container.new();

          cnt.use(singletonD);
          cnt.use(scopedD);
          cnt.use(transientD);

          for (let i = 0; i < runCount; i++) {
            using scope1 = cnt.scope();

            scope1.use(singletonD);
            scope1.use(scopedD);
            scope1.use(transientD);

            using scope2 = scope1.scope(s => {
              s.cascade(scopedD);
            });

            scope2.use(singletonD);
            scope2.use(scopedD);
            scope2.use(transientD);
          }
        }

        main();

        await vi.waitFor(async () => {
          await runGC();
          expect(count).toBe(0);
        });
      });
    });
  });
});
