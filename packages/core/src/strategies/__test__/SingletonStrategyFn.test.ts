import { all, container } from '../../container/Container.js';
import { v4 } from 'uuid';
import { fn } from '../../definitions/definitions.js';

import { BoxedValue } from '../../__test__/BoxedValue.js';
import { describe, expect, it } from 'vitest';
import { value } from '../../definitions/sync/value.js';

describe(`SingletonStrategy`, () => {
  describe(`sync resolution`, () => {
    const someValue = fn.singleton(() => 'someString');

    const leaf = fn.singleton(use => {
      return {
        value: use(someValue),
        id: v4(),
      };
    });

    const consumer = fn.singleton(use => {
      return { testClassInstance: use(leaf) };
    });

    describe(`resolution`, () => {
      describe(`single module`, () => {
        it(`returns class instance`, async () => {
          const c = container.new();
          expect(c.use(leaf)).toHaveProperty('value');
          expect(c.use(leaf)).toHaveProperty('id');
        });

        it(`constructs class with correct dependencies`, async () => {
          const c = container.new();
          const instance = c.use(leaf);
          expect(instance.value).toEqual('someString');
        });

        it(`caches class instance`, async () => {
          const c = container.new();
          const instance = c.use(leaf);
          const instance2 = c.use(leaf);
          expect(instance).toBe(instance2);
        });
      });

      describe(`singleton shared across multiple modules hierarchy`, () => {
        const theSingleton = fn.singleton(use => use(leaf));

        const rootSingletonConsumer = fn.singleton(use => use(consumer));
        const child1SingletonConsumer = fn.singleton(use => use(consumer));
        const child2SingletonConsumer = fn.singleton(use => use(consumer));

        it(`reuses the same instance`, async () => {
          const c = container.new();
          const consumerFromRoot = c.use(rootSingletonConsumer);
          const consumerFromChild1 = c.use(child1SingletonConsumer);
          const consumerFromChild2 = c.use(child2SingletonConsumer);
          const theSingletonInstance = c.use(theSingleton);
          expect(consumerFromChild1.testClassInstance.id).toEqual(theSingletonInstance.id);
          expect(consumerFromChild2.testClassInstance.id).toEqual(theSingletonInstance.id);
          expect(consumerFromRoot.testClassInstance.id).toEqual(theSingletonInstance.id);
        });

        it(`reuses the same instance for lazily loaded modules`, async () => {
          const c = container.new();

          const consumerFromChild1 = c.use(child1SingletonConsumer);
          const consumerFromChild2 = c.use(child2SingletonConsumer);
          const theSingletonInstance = c.use(theSingleton);
          expect(consumerFromChild1.testClassInstance.id).toEqual(theSingletonInstance.id);
          expect(consumerFromChild2.testClassInstance.id).toEqual(theSingletonInstance.id);
        });
      });

      describe(`multiple containers`, () => {
        it(`does not shares instances across multiple containers`, async () => {
          const c1 = container.new();
          const instanceFromC1 = c1.use(leaf);

          const c2 = container.new();
          const instanceFromC2 = c2.use(leaf);
          expect(instanceFromC1.id).not.toEqual(instanceFromC2.id);
        });
      });
    });

    describe(`scope overrides`, () => {
      it(`replaces definitions for singleton scope`, async () => {
        const a = value(1);

        const c = container.new();

        const childC = c.checkoutScope(scope => {
          scope.cascade(a).toValue(2);
        });

        expect(childC.use(a)).toEqual(2);
        expect(c.use(a)).toEqual(1);
      });

      it(`inherits singleton instance from parent scope`, async () => {
        const a = value(1);

        const root = container.new();

        const level1 = root.checkoutScope(scope => {
          scope.cascade(a).toValue(2);
        });

        const level2 = level1.checkoutScope();

        expect(level1.use(a)).toEqual(2);
        expect(level2.use(a)).toEqual(2);
        expect(root.use(a)).toEqual(1);
      });

      it(`propagates singletons created in child scope to parent scope (if not replaced with patches)`, async () => {
        const a = fn.singleton(() => Math.random());

        const parentC = container.new();
        const childC = parentC.checkoutScope();

        const req1 = childC.use(a); // important that childC is called as first
        const req2 = parentC.use(a);
        expect(req1).toEqual(req2);
      });

      it(`propagates singletons created in descendent scope to first ascendant scope which does not have binding for definition`, async () => {
        const randomFactorySpy = vi.fn().mockImplementation(() => Math.random());

        const a = fn.singleton(randomFactorySpy);

        const root = container.new();
        const level1 = root.checkoutScope();

        const level2 = level1.checkoutScope(scope => {
          scope.cascade(a).toValue(1);
        });

        const level3 = level2.checkoutScope();

        // important that level3 is called as first, to check if the value will "propagate" to level2
        // as it defines cascading binding
        const level3Call = level3.use(a);
        const level2Call = level2.use(a);
        const level1Call = level1.use(a);
        const rootCall = root.use(a);

        expect(level1Call).toEqual(rootCall); // random value
        expect(level2Call).toEqual(1);
        expect(level3Call).toEqual(1);
        expect(randomFactorySpy).toHaveBeenCalledTimes(1);
      });

      it(`does not propagate singletons created in descendent scope to ascendant scopes if all ascendant scopes has patched value`, async () => {
        const randomFactorySpy = vi.fn().mockImplementation(() => Math.random());

        const a = fn.singleton(randomFactorySpy);

        const root = container.new();

        const level1 = root.checkoutScope(scope => {
          scope.cascade(a).toValue(1);
        });

        const level2 = level1.checkoutScope(scope => {
          scope.cascade(a).toValue(2);
        });
        const level3 = level2.checkoutScope();

        const level3Call = level3.use(a);
        const level2Call = level2.use(a);
        const level1Call = level1.use(a);
        const rootCall = root.use(a);

        expect(level3Call).toEqual(level2Call);
        expect(level2Call).toEqual(2);
        expect(level1Call).toEqual(1);
        expect(rootCall).not.toEqual(level3);
        expect(randomFactorySpy).toHaveBeenCalledTimes(1);
      });

      it(`it's not allowed to bind singleton definitions for child scopes`, async () => {
        const a = fn.singleton(() => 1);

        const root = container.new();

        expect(() =>
          root.checkoutScope(c => {
            // @ts-expect-error - should not be possible to override singleton
            c.bind(a).toValue(2);
          }),
        ).toThrowError();
      });

      it(`propagates singletons created in child scope to parent scope`, async () => {
        const a = fn.singleton(() => Math.random());

        const parentC = container.new();
        const childC = parentC.checkoutScope();

        const req1 = childC.use(a); // important that childC is called as first
        const req2 = parentC.use(a);
        expect(req1).toEqual(req2);
      });

      it(`propagates singletons requested from the child scope when definition was frozen in the root container`, async () => {
        const a = fn.singleton(() => Math.random());

        const parentC = container.new(c => {
          c.freeze(a).toValue(1);
        });

        const childC = parentC.checkoutScope();

        const req1 = childC.use(a);
        const req2 = parentC.use(a);

        expect(req1).toEqual(1);
        expect(req2).toEqual(1);
      });

      it(`propagates singletons requested from the child scope when definition was frozen in the root container, ex.2`, async () => {
        const a = fn.singleton(() => Math.random());
        const consumer = fn.scoped(use => use(a));

        const parentC = container.new(c => {
          c.freeze(a).toValue(1);
        });

        const childC = parentC.checkoutScope();

        const req1 = childC.use(consumer);
        const req2 = parentC.use(consumer);

        expect(req1).toEqual(1);
        expect(req2).toEqual(1);
      });
    });

    describe('frozen definitions', function () {
      it(`cannot be replaced by cascade`, async () => {
        const k1 = fn.singleton(() => Math.random());

        const c = container.new(container => {
          container.freeze(k1).toValue(1);
        });

        expect(c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope(scope => {
          scope.cascade(k1).toValue(2);
        });

        expect(childScope.use(k1)).toEqual(1);
      });

      it(`allows for bindings other definitions`, async () => {
        const k1 = fn.singleton(() => Math.random());
        const k2 = fn.singleton(() => Math.random());

        const c = container.new(container => {
          container.freeze(k1).toValue(1);
        });

        expect(c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope(scope => {
          scope.cascade(k2).toValue(2);
        });
        expect(childScope.use(k1)).toEqual(1);
        expect(childScope.use(k2)).toEqual(2);
      });
    });
  });

  describe(`async resolution`, () => {
    const resolveAfter = <T>(timeout: number, value: T): Promise<T> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(value);
        }, timeout);
      });
    };

    class TestClassArgs2 {
      constructor(
        public someNumber: number,
        public someString: string,
      ) {}
    }

    describe(`class`, () => {
      describe(`no dependencies`, () => {
        it(`returns correct value`, async () => {
          class NoArgsCls {
            value = Math.random();
          }

          const asyncDef = fn.singleton(async () => new NoArgsCls());

          const result = await container.new().use(asyncDef);
          expect(result).toBeInstanceOf(NoArgsCls);
        });
      });

      describe(`dependencies`, () => {
        it(`returns correct value, ex.1`, async () => {
          const asyncDep = fn.singleton(async () => 123);
          const syncDep = fn.singleton(() => 'str');
          const asyncDef = fn.singleton(async use => {
            return new TestClassArgs2(await use(asyncDep), await use(syncDep));
          });
          const result = await container.new().use(asyncDef);
          expect(result.someString).toEqual('str');
          expect(result.someNumber).toEqual(123);
        });

        it(`returns correct value, ex.2`, async () => {
          const asyncDep = fn.singleton(async () => 123);
          const syncDep = fn.singleton(async () => 'str');
          const asyncDef = fn.singleton(async use => {
            return new TestClassArgs2(await use(asyncDep), await use(syncDep));
          });
          const result = await container.new().use(asyncDef);
          expect(result.someString).toEqual('str');
          expect(result.someNumber).toEqual(123);
        });

        it(`returns correct value, ex.2`, async () => {
          const asyncDep = fn.singleton(async () => 123);
          const syncDep = fn.singleton(async () => 'str');
          const asyncDef = fn.singleton(async use => {
            return new TestClassArgs2(await use(asyncDep), await use(syncDep));
          });
          const result = await container.new().use(asyncDef);
          expect(result.someString).toEqual('str');
          expect(result.someNumber).toEqual(123);
        });
      });
    });

    describe(`fn`, () => {
      describe(`no dependencies`, () => {
        it(`returns correct value`, async () => {
          const asyncDef = fn.singleton(async () => 123);
          const result = await container.new().use(asyncDef);
          expect(result).toEqual(123);
        });
      });

      describe(`dependencies`, () => {
        describe(`mixed async and sync dependencies`, () => {
          it(`returns correct value`, async () => {
            const asyncDep = fn.singleton(async () => 123);
            const syncDep = fn.singleton(() => 'str');

            const asyncDef = fn.singleton(async use => {
              return [await use(asyncDep), use(syncDep)];
            });
            const result = await container.new().use(asyncDef);
            expect(result).toEqual([123, 'str']);
          });
        });

        describe(`only async dependencies`, () => {
          it(`returns correct value`, async () => {
            const asyncDep = fn.singleton(async () => 123);
            const syncDep = fn.singleton(() => 'str');

            const asyncDef = fn.singleton(async use => {
              return [await use(asyncDep), use(syncDep)];
            });
            const result = await container.new().use(asyncDef);
            expect(result).toEqual([123, 'str']);
          });
        });

        describe(`only sync dependencies`, () => {
          it(`returns correct value`, async () => {
            const asyncDep = fn.singleton(() => 123);
            const syncDep = fn.singleton(() => 'str');

            const asyncDef = fn.singleton(async use => {
              return [use(asyncDep), use(syncDep)];
            });
            const result = await container.new().use(asyncDef);
            expect(result).toEqual([123, 'str']);
          });
        });
      });

      describe(`race condition`, () => {
        it(`does not create singleton duplicates`, async () => {
          const slowSingleton = fn.singleton(() => resolveAfter(Math.random() * 500, new BoxedValue(Math.random())));

          const consumer1 = fn.singleton(async use => {
            return use(slowSingleton);
          });

          const consumer2 = fn.singleton(async use => {
            return use(slowSingleton);
          });

          const ctn = container.new();

          const [result1, result2] = await Promise.all([ctn.use(consumer1), ctn.use(consumer2)]);

          expect(result1).toBe(result2);
        });

        it(`does not create singleton duplicates, ex.2`, async () => {
          const randomSleep = () => new Promise(resolve => setTimeout(resolve, Math.random() * 200));

          const counter = fn.singleton(() => {
            return new BoxedValue(0);
          });

          const slowSingleton = fn.singleton(use => {
            const _counter = use(counter);
            _counter.value++;

            return new BoxedValue(Math.random());
          });

          const consumer1 = fn.singleton(async use => {
            await randomSleep();
            return use(slowSingleton);
          });

          const consumer2 = fn.singleton(async use => {
            await randomSleep();
            return use(slowSingleton);
          });

          const [result1, result2, counterValue] = await all(consumer1, consumer2, counter);

          expect(result1).toBe(result2);
          expect(counterValue.value).toEqual(1);
        });
      });

      describe(`global overrides`, () => {
        it(`returns correct instance`, async () => {
          const slowSingleton = fn.singleton(() => resolveAfter(Math.random() * 500, new BoxedValue(Math.random())));

          const consumer1 = fn.singleton(async use => use(slowSingleton));
          const consumer2 = fn.singleton(async use => use(slowSingleton));

          const ctn = container.new(container => {
            container.freeze(slowSingleton).to(fn.singleton(async () => new BoxedValue(123)));
          });

          const [result1, result2] = await Promise.all([ctn.use(consumer1), ctn.use(consumer2)]);
          expect(result1.value).toEqual(123);
          expect(result2.value).toEqual(123);
        });
      });
    });

    describe(`race condition`, () => {
      it(`does not create singleton duplicates`, async () => {
        const slowSingleton = fn.singleton(() => resolveAfter(Math.random() * 500, new BoxedValue(Math.random())));

        const consumer1 = fn.singleton(async use => use(slowSingleton));
        const consumer2 = fn.singleton(async use => use(slowSingleton));

        const ctn = container.new();

        const [result1, result2] = await Promise.all([ctn.use(consumer1), ctn.use(consumer2)]);

        expect(result1).toBe(result2);
      });

      it(`does not create singleton duplicates, ex.2`, async () => {
        const slowSingleton = fn.singleton(() => resolveAfter(500, new BoxedValue(Math.random())));

        const beforeConsumer1 = fn.singleton(async use => {
          const s = await use(slowSingleton);
          return resolveAfter(s.value, 10);
        });

        const beforeConsumer2 = fn.singleton(async use => {
          const s = await use(slowSingleton);
          return resolveAfter(s.value, 10);
        });

        const beforeConsumer3 = fn.singleton(async use => {
          const s = await use(slowSingleton);
          return resolveAfter(s.value, 10);
        });

        const consumer1 = fn.singleton(async use => {
          return await use(beforeConsumer1);
        });

        const consumer2 = fn.singleton(async use => {
          return await use(beforeConsumer2);
        });

        const consumer3 = fn.singleton(async use => {
          return await use(beforeConsumer3);
        });

        const ctn = container.new();

        const result1 = await ctn.use(consumer1);
        const result2 = await ctn.use(consumer2);
        const result3 = await ctn.use(consumer3);

        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      });
    });
  });
});
