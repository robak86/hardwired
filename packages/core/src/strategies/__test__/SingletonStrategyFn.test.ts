import { container } from '../../container/Container.js';
import { set } from '../../patching/set.js';
import { v4 } from 'uuid';
import { fn, singleton } from '../../definitions/definitions.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { replace } from '../../patching/replace.js';
import { describe, expect, it, vi } from 'vitest';

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
          const c = container();
          expect(c.call(leaf)).toHaveProperty('value');
          expect(c.call(leaf)).toHaveProperty('id');
        });

        it(`constructs class with correct dependencies`, async () => {
          const c = container();
          const instance = c.call(leaf);
          expect(instance.value).toEqual('someString');
        });

        it(`caches class instance`, async () => {
          const c = container();
          const instance = c.call(leaf);
          const instance2 = c.call(leaf);
          expect(instance).toBe(instance2);
        });
      });

      describe(`singleton shared across multiple modules hierarchy`, () => {
        const theSingleton = fn.singleton(use => use(leaf));

        const rootSingletonConsumer = fn.singleton(use => use(consumer));
        const child1SingletonConsumer = fn.singleton(use => use(consumer));
        const child2SingletonConsumer = fn.singleton(use => use(consumer));

        it(`reuses the same instance`, async () => {
          const c = container();
          const consumerFromRoot = c.call(rootSingletonConsumer);
          const consumerFromChild1 = c.call(child1SingletonConsumer);
          const consumerFromChild2 = c.call(child2SingletonConsumer);
          const theSingletonInstance = c.call(theSingleton);
          expect(consumerFromChild1.testClassInstance.id).toEqual(theSingletonInstance.id);
          expect(consumerFromChild2.testClassInstance.id).toEqual(theSingletonInstance.id);
          expect(consumerFromRoot.testClassInstance.id).toEqual(theSingletonInstance.id);
        });

        it(`reuses the same instance for lazily loaded modules`, async () => {
          const c = container();

          const consumerFromChild1 = c.call(child1SingletonConsumer);
          const consumerFromChild2 = c.call(child2SingletonConsumer);
          const theSingletonInstance = c.call(theSingleton);
          expect(consumerFromChild1.testClassInstance.id).toEqual(theSingletonInstance.id);
          expect(consumerFromChild2.testClassInstance.id).toEqual(theSingletonInstance.id);
        });
      });

      describe(`multiple containers`, () => {
        it(`does not shares instances across multiple containers`, async () => {
          const c1 = container();
          const instanceFromC1 = c1.call(leaf);

          const c2 = container();
          const instanceFromC2 = c2.call(leaf);
          expect(instanceFromC1.id).not.toEqual(instanceFromC2.id);
        });
      });
    });

    describe(`scope overrides`, () => {
      it(`replaces definitions for singleton scope`, async () => {
        // const a = fn.singleton(() => 1);
        //
        // const c = ContainerContext.empty();
        //
        // const patchedA = set(a, 2);
        // const childC = c.checkoutScope({ overrides: [patchedA] });
        //
        // expect(childC.use(a)).toEqual(2);
        // expect(c.use(a)).toEqual(1);
      });

      it(`inherits singleton instance from parent scope`, async () => {
        const a = fn.singleton(() => 1);

        const root = ContainerContext.empty();

        const patchedA = a.patch().set(2);

        const level1 = root.checkoutScope({ overrides: [patchedA] });
        const level2 = level1.checkoutScope({});

        expect(level1.requestCall(a)).toEqual(2);
        expect(level2.requestCall(a)).toEqual(2);
        expect(root.requestCall(a)).toEqual(1);
      });

      it(`propagates singletons created in child scope to parent scope (if not replaced with patches)`, async () => {
        const a = singleton.fn(() => Math.random());

        const parentC = ContainerContext.empty();
        const childC = parentC.checkoutScope({});

        const req1 = childC.use(a); // important that childC is called as first
        const req2 = parentC.use(a);
        expect(req1).toEqual(req2);
      });

      it(`propagates singletons created in descendent scope to first ascendant scope which does not overrides definition`, async () => {
        const randomFactorySpy = vi.fn().mockImplementation(() => Math.random());

        const a = singleton.fn(randomFactorySpy);

        const root = ContainerContext.empty();
        const level1 = root.checkoutScope();
        const level2 = level1.checkoutScope({ overrides: [set(a, 1)] });
        const level3 = level2.checkoutScope();

        const level3Call = level3.use(a); // important that level1 is called as first
        const level2Call = level2.use(a);
        const level1Call = level1.use(a);
        const rootCall = root.use(a);

        expect(level1Call).toEqual(rootCall);
        expect(level2Call).toEqual(1);
        expect(level3Call).toEqual(1);
        expect(randomFactorySpy).toHaveBeenCalledTimes(1);
      });

      it(`does not propagate singletons created in descendent scope to ascendant scopes if all ascendant scopes has patched value`, async () => {
        const randomFactorySpy = vi.fn().mockImplementation(() => Math.random());

        const a = singleton.fn(randomFactorySpy);

        const root = ContainerContext.empty();
        const level1 = root.checkoutScope({ overrides: [set(a, 1)] });
        const level2 = level1.checkoutScope({ overrides: [set(a, 2)] });
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
    });

    describe('global overrides', function () {
      it(`cannot be replaced by overrides`, async () => {
        const k1 = fn.singleton(() => Math.random());
        const invariantPatch = k1.patch().set(1);
        const childScopePatch = k1.patch().set(2);

        const c = ContainerContext.create([], [invariantPatch]);
        expect(c.requestCall(k1)).toEqual(1);

        const childScope = c.checkoutScope({ overrides: [childScopePatch] });
        expect(childScope.requestCall(k1)).toEqual(1);
      });

      it(`allows for overrides for other keys than ones changes invariants array`, async () => {
        const k1 = fn.singleton(() => Math.random());
        const k2 = fn.singleton(() => Math.random());

        const invariantPatch = k1.patch().set(1);
        const childScopePatch = k2.patch().set(2);

        const c = ContainerContext.create([invariantPatch], []);

        expect(c.requestCall(k1)).toEqual(1);

        const childScope = c.checkoutScope({ overrides: [childScopePatch] });
        expect(childScope.requestCall(k1)).toEqual(1);
        expect(childScope.requestCall(k2)).toEqual(2);
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

          const asyncDef = singleton.async().class(NoArgsCls);
          const result = await container().use(asyncDef);
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
          const result = await container().call(asyncDef);
          expect(result.someString).toEqual('str');
          expect(result.someNumber).toEqual(123);
        });

        it(`returns correct value, ex.2`, async () => {
          const asyncDep = fn.singleton(async () => 123);
          const syncDep = fn.singleton(async () => 'str');
          const asyncDef = fn.singleton(async use => {
            return new TestClassArgs2(await use(asyncDep), await use(syncDep));
          });
          const result = await container().call(asyncDef);
          expect(result.someString).toEqual('str');
          expect(result.someNumber).toEqual(123);
        });

        it(`returns correct value, ex.2`, async () => {
          const asyncDep = fn.singleton(async () => 123);
          const syncDep = fn.singleton(async () => 'str');
          const asyncDef = fn.singleton(async use => {
            return new TestClassArgs2(await use(asyncDep), await use(syncDep));
          });
          const result = await container().call(asyncDef);
          expect(result.someString).toEqual('str');
          expect(result.someNumber).toEqual(123);
        });
      });
    });

    describe(`fn`, () => {
      describe(`no dependencies`, () => {
        it(`returns correct value`, async () => {
          const asyncDef = fn.singleton(async () => 123);
          const result = await container().call(asyncDef);
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
            const result = await container().call(asyncDef);
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
            const result = await container().call(asyncDef);
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
            const result = await container().call(asyncDef);
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

          const ctn = container();

          const [result1, result2] = await Promise.all([ctn.call(consumer1), ctn.call(consumer2)]);

          expect(result1).toBe(result2);
        });
      });

      describe(`global overrides`, () => {
        it(`returns correct instance`, async () => {
          const slowSingleton = fn.singleton(() => resolveAfter(Math.random() * 500, new BoxedValue(Math.random())));

          const consumer1 = fn.singleton(async use => use(slowSingleton));
          const consumer2 = fn.singleton(async use => use(slowSingleton));

          const patch = slowSingleton.patch().replace(fn.singleton(async () => new BoxedValue(123)));

          const ctn = container({ globalOverrides: [patch] });
          const [result1, result2] = await Promise.all([ctn.call(consumer1), ctn.call(consumer2)]);
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

        const ctn = container();

        const [result1, result2] = await Promise.all([ctn.call(consumer1), ctn.call(consumer2)]);

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

        const ctn = container();

        const result1 = await ctn.call(consumer1);
        const result2 = await ctn.call(consumer2);
        const result3 = await ctn.call(consumer3);

        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      });
    });
  });
});
