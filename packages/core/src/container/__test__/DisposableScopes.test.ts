import { vi } from 'vitest';

import { container } from '../Container.js';
import { fn } from '../../definitions/definitions.js';
import { runGC } from '../../utils/__test__/ScopesRegistry.test.js';

describe(`registering scopes`, () => {
  const singleton1 = fn.singleton(() => 'singleton1');
  const singleton2 = fn.singleton(async () => 'singleton2');

  describe(`rootContainer`, () => {
    describe(`scoped`, () => {
      it(`disposes scoped instances`, async () => {
        const disposeSpy = vi.fn<[string]>();
        const scoped1 = fn.scoped(() => 'scoped1');

        function main() {
          const cnt = container.new(c => {
            c.onDispose(scoped1, val => disposeSpy(val));
          });

          cnt.use(scoped1);
        }

        main();

        await runGC();

        await vi.waitFor(() => {
          expect(disposeSpy).toHaveBeenCalledWith('scoped1');
        });
      });
    });

    describe(`singletons`, () => {
      describe(`instance was created`, () => {
        it(`disposes root container disposables when it is garbage collected`, async () => {
          const disposeSpy = vi.fn<[string]>();

          function main() {
            const cnt = container.new(c => {
              c.onDispose(singleton1, val => disposeSpy(val));
            });

            cnt.use(singleton1);
          }

          main();

          await runGC();

          expect(disposeSpy).toHaveBeenCalledWith('singleton1');
        });

        it(`disposes multiple definitions`, async () => {
          const disposeSpy = vi.fn<[string]>();

          async function main() {
            const cnt = container.new(c => {
              c.onDispose(singleton1, val => disposeSpy(val));
              c.onDispose(singleton2, val => disposeSpy(val));
            });

            cnt.use(singleton1);
            await cnt.use(singleton2);
          }

          await main();

          await runGC();

          expect(disposeSpy).toHaveBeenNthCalledWith(1, 'singleton1');
          expect(disposeSpy).toHaveBeenNthCalledWith(2, 'singleton2');
        });

        it(`doesn't crash when dispose throws`, async () => {
          const disposeSpy = vi.fn<[string]>(() => {
            throw new Error('dispose error');
          });

          function main() {
            const cnt = container.new(c => {
              c.onDispose(singleton1, val => disposeSpy(val));
            });

            cnt.use(singleton1);
          }

          main();

          await runGC();

          expect(disposeSpy).toHaveBeenCalledWith('singleton1');
        });

        it(`doesn't create mem leaks`, async () => {
          const created: number[] = [];
          const disposed: number[] = [];

          const sideEffectDef = fn.singleton(() => {
            const val = Math.random();

            created.push(val);

            return val;
          });

          function main() {
            const cnt = container.new(c => {
              c.onDispose(sideEffectDef, val => {
                console.log('DISPOSE', val);
                disposed.push(val);
              });
            });

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

      describe(`instance wasn't created`, () => {
        it(`doesnt run dispose functions`, async () => {
          const disposeSpy = vi.fn<[string]>();

          function main() {
            container.new(c => {
              c.onDispose(singleton1, val => disposeSpy(val));
            });
          }

          main();

          await runGC();

          expect(disposeSpy).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe(`scopes`, () => {
    describe(`scoped`, () => {
      it(`disposes scoped instances`, async () => {
        const scoped1 = fn.scoped(() => 'scoped1');
        const disposeSpy = vi.fn<[string]>();
        const cnt = container.new();

        function main() {
          const scope = cnt.scope(c => {
            c.onDispose(scoped1, val => disposeSpy(val));
          });

          scope.use(scoped1);
        }

        main();

        await runGC();

        await vi.waitFor(() => {
          expect(disposeSpy).toHaveBeenCalledWith('scoped1');
        });
      });

      it(`correctly disposes nested scopes`, async () => {
        const scoped1 = fn.scoped(() => 'scoped1');
        const disposeSpy = vi.fn<[string]>();
        const cnt = container.new();

        function main() {
          const scope1 = cnt.scope(c => {
            c.onDispose(scoped1, val => disposeSpy(val));
          });

          const scope2 = scope1.scope(c => {
            c.onDispose(scoped1, val => disposeSpy(val));
          });

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
        const scoped1 = fn.scoped(() => 'scoped1');
        const disposeSpy = vi.fn<[string]>();
        const cnt = container.new();

        console.log('containerId', cnt.id);

        function main() {
          const scope1 = cnt.scope(c => {
            c.onDispose(scoped1, val => disposeSpy(val));

            c.cascade(scoped1);
          });

          console.log('scope1Id', scope1.id);

          const scope2 = scope1.scope(c => {
            // c.onDispose(scoped1, val => disposeSpy(val));
          });

          console.log('scope2Id', scope2.id);

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
});
