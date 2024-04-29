import { container } from '../../container/Container.js';
import { set } from '../../patching/set.js';
import { v4 } from 'uuid';
import { singleton } from '../../definitions/definitions.js';
import { value } from '../../definitions/sync/value.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { replace } from '../../patching/replace.js';
import { describe, it, expect, vi } from 'vitest';

describe(`SingletonStrategy`, () => {
  describe(`sync resolution`, () => {
    class TestClass {
      public id = v4();

      constructor(public value: string) {}
    }

    class TestClassConsumer {
      constructor(public testClassInstance: TestClass) {}
    }

    describe(`resolution`, () => {
      describe(`single module`, () => {
        const someValue = value('someString');
        const a = singleton.using(someValue).class(TestClass);

        it(`returns class instance`, async () => {
          const c = container();
          expect(c.use(a)).toBeInstanceOf(TestClass);
        });

        it(`constructs class with correct dependencies`, async () => {
          const c = container();
          const instance = c.use(a);
          expect(instance.value).toEqual('someString');
        });

        it(`caches class instance`, async () => {
          const c = container();
          const instance = c.use(a);
          const instance2 = c.use(a);
          expect(instance).toBe(instance2);
        });
      });

      describe(`singleton shared across multiple modules hierarchy`, () => {
        // const root = unit()
        //   .import('child1', () => child1)
        //   .import('child2', () => child2)
        //
        //   .import('singletonModule', () => singletonModule)
        //   .define(
        //     'singletonConsumer',
        //     singleton,
        //     ({ singletonModule }) => new TestClassConsumer(singletonModule.theSingleton),
        //   )
        //   .build();

        const someValue = value('someValue');
        const theSingleton = singleton.using(someValue).class(TestClass);

        const rootSingletonConsumer = singleton.using(theSingleton).class(TestClassConsumer);
        const child1SingletonConsumer = singleton.using(theSingleton).class(TestClassConsumer);
        const child2SingletonConsumer = singleton.using(theSingleton).class(TestClassConsumer);

        it(`reuses the same instance`, async () => {
          const c = container();
          const consumerFromRoot = c.use(rootSingletonConsumer);
          const consumerFromChild1 = c.use(child1SingletonConsumer);
          const consumerFromChild2 = c.use(child2SingletonConsumer);
          const theSingletonInstance = c.use(theSingleton);
          expect(consumerFromChild1.testClassInstance.id).toEqual(theSingletonInstance.id);
          expect(consumerFromChild2.testClassInstance.id).toEqual(theSingletonInstance.id);
          expect(consumerFromRoot.testClassInstance.id).toEqual(theSingletonInstance.id);
        });

        it(`reuses the same instance for lazily loaded modules`, async () => {
          const c = container();

          const consumerFromChild1 = c.use(child1SingletonConsumer);
          const consumerFromChild2 = c.use(child2SingletonConsumer);
          const theSingletonInstance = c.use(theSingleton);
          expect(consumerFromChild1.testClassInstance.id).toEqual(theSingletonInstance.id);
          expect(consumerFromChild2.testClassInstance.id).toEqual(theSingletonInstance.id);
        });
      });

      describe(`multiple containers`, () => {
        it(`does not shares instances across multiple containers`, async () => {
          const someValue = value('someString');
          const a = singleton.using(someValue).class(TestClass);

          const c1 = container();
          const instanceFromC1 = c1.use(a);

          const c2 = container();
          const instanceFromC2 = c2.use(a);
          expect(instanceFromC1.id).not.toEqual(instanceFromC2.id);
        });
      });

      // describe(`container scopes`, () => {});
    });

    describe(`scope overrides`, () => {
      it(`replaces definitions for singleton scope`, async () => {
        const a = value(1);

        const c = ContainerContext.empty();

        const patchedA = set(a, 2);
        const childC = c.checkoutScope({ overrides: [patchedA] });

        expect(childC.use(a)).toEqual(2);
        expect(c.use(a)).toEqual(1);
      });

      it(`inherits singleton instance from parent scope`, async () => {
        const a = value(1);

        const root = ContainerContext.empty();

        const patchedA = set(a, 2);

        const level1 = root.checkoutScope({ overrides: [patchedA] });
        const level2 = level1.checkoutScope({});

        expect(level1.use(a)).toEqual(2);
        expect(level2.use(a)).toEqual(2);
        expect(root.use(a)).toEqual(1);
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
        const k1 = singleton.fn(() => Math.random());
        const invariantPatch = set(k1, 1);
        const childScopePatch = set(k1, 2);

        const c = ContainerContext.create([], [invariantPatch]);
        expect(c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope({ overrides: [childScopePatch] });
        expect(childScope.use(k1)).toEqual(1);
      });

      it(`allows for overrides for other keys than ones changes invariants array`, async () => {
        const k1 = singleton.fn(() => Math.random());
        const k2 = singleton.fn(() => Math.random());

        const invariantPatch = set(k1, 1);
        const childScopePatch = set(k2, 2);

        const c = ContainerContext.create([invariantPatch], []);

        expect(c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope({ overrides: [childScopePatch] });
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

          const asyncDef = singleton.async().class(NoArgsCls);
          const result = await container().use(asyncDef);
          expect(result).toBeInstanceOf(NoArgsCls);
        });
      });

      describe(`dependencies`, () => {
        it(`returns correct value, ex.1`, async () => {
          const asyncDep = singleton.async().fn(async () => 123);
          const syncDep = singleton.fn(() => 'str');
          const asyncDef = singleton.async().using(asyncDep, syncDep).class(TestClassArgs2);
          const result = await container().use(asyncDef);
          expect(result.someString).toEqual('str');
          expect(result.someNumber).toEqual(123);
        });

        it(`returns correct value, ex.2`, async () => {
          const asyncDep = singleton.async().fn(async () => 123);
          const syncDep = singleton.async().fn(async () => 'str');
          const asyncDef = singleton.async().using(asyncDep, syncDep).class(TestClassArgs2);
          const result = await container().use(asyncDef);
          expect(result.someString).toEqual('str');
          expect(result.someNumber).toEqual(123);
        });

        it(`returns correct value, ex.2`, async () => {
          const asyncDep = singleton.fn(() => 123);
          const syncDep = singleton.fn(() => 'str');
          const asyncDef = singleton.using(asyncDep, syncDep).async().class(TestClassArgs2);
          const result = await container().use(asyncDef);
          expect(result.someString).toEqual('str');
          expect(result.someNumber).toEqual(123);
        });
      });
    });

    describe(`fn`, () => {
      describe(`no dependencies`, () => {
        it(`returns correct value`, async () => {
          const asyncDef = singleton.async().fn(async () => 123);
          const result = await container().use(asyncDef);
          expect(result).toEqual(123);
        });
      });

      describe(`dependencies`, () => {
        describe(`mixed async and sync dependencies`, () => {
          it(`returns correct value`, async () => {
            const asyncDep = singleton.async().fn(async () => 123);
            const syncDep = singleton.fn(() => 'str');

            const asyncDef = singleton
              .async()
              .using(asyncDep, syncDep)
              .fn(async (a: number, b: string) => [a, b]);
            const result = await container().use(asyncDef);
            expect(result).toEqual([123, 'str']);
          });
        });

        describe(`only async dependencies`, () => {
          it(`returns correct value`, async () => {
            const asyncDep = singleton.async().fn(async () => 123);
            const syncDep = singleton.async().fn(async () => 'str');

            const asyncDef = singleton
              .async()
              .using(asyncDep, syncDep)
              .fn(async (a: number, b: string) => [a, b]);
            const result = await container().use(asyncDef);
            expect(result).toEqual([123, 'str']);
          });
        });

        describe(`only sync dependencies`, () => {
          it(`returns correct value`, async () => {
            const asyncDep = singleton.fn(() => 123);
            const syncDep = singleton.fn(() => 'str');

            const asyncDef = singleton
              .async()
              .using(asyncDep, syncDep)
              .fn(async (a: number, b: string) => [a, b]);
            const result = await container().use(asyncDef);
            expect(result).toEqual([123, 'str']);
          });
        });
      });

      describe(`race condition`, () => {
        it(`does not create singleton duplicates`, async () => {
          const slowSingleton = singleton.async().fn(() => resolveAfter(500, new BoxedValue(Math.random())));
          const consumer1 = singleton
            .async()
            .using(slowSingleton)
            .fn(async s => s);
          const consumer2 = singleton
            .async()
            .using(slowSingleton)
            .fn(async s => s);
          const ctn = container();

          const [result1, result2] = await Promise.all([ctn.use(consumer1), ctn.use(consumer2)]);

          expect(result1).toBe(result2);
        });
      });

      describe(`global overrides`, () => {
        it(`returns correct instance`, async () => {
          const slowSingleton = singleton.async().fn(() => resolveAfter(500, new BoxedValue(Math.random())));
          const consumer1 = singleton
            .async()
            .using(slowSingleton)
            .fn(async s => s);
          const consumer2 = singleton
            .async()
            .using(slowSingleton)
            .fn(async s => s);
          const patch = replace(
            slowSingleton,
            singleton.async().fn(async () => new BoxedValue(123)),
          );

          const ctn = container({ globalOverrides: [patch] });
          const [result1, result2] = await Promise.all([ctn.use(consumer1), ctn.use(consumer2)]);
          expect(result1.value).toEqual(123);
          expect(result2.value).toEqual(123);
        });
      });
    });

    describe(`race condition`, () => {
      it(`does not create singleton duplicates`, async () => {
        const slowSingleton = singleton.async().fn(() => resolveAfter(500, new BoxedValue(Math.random())));
        const consumer1 = singleton
          .async()
          .using(slowSingleton)
          .fn(async s => s);
        const consumer2 = singleton
          .async()
          .using(slowSingleton)
          .fn(async s => s);
        const ctn = container();

        const [result1, result2] = await Promise.all([ctn.use(consumer1), ctn.use(consumer2)]);

        expect(result1).toBe(result2);
      });

      it(`does not create singleton duplicates, ex.2`, async () => {
        const slowSingleton = singleton.async().fn(() => resolveAfter(500, new BoxedValue(Math.random())));
        const beforeConsumer1 = singleton
          .async()
          .using(slowSingleton)
          .fn(async s => resolveAfter(s.value, 10));

        const beforeConsumer2 = singleton
          .async()
          .using(slowSingleton)
          .fn(async s => resolveAfter(s.value, 10));

        const beforeConsumer3 = singleton
          .async()
          .using(slowSingleton)
          .fn(async s => resolveAfter(s.value, 10));

        const consumer1 = singleton
          .async()
          .using(beforeConsumer1)
          .fn(async s => s);

        const consumer2 = singleton
          .async()
          .using(beforeConsumer2)
          .fn(async s => s);

        const consumer3 = singleton
          .async()
          .using(beforeConsumer3)
          .fn(async s => s);

        const ctn = container();

        const [result1, result2, result3] = await ctn.getAllAsync(consumer1, consumer2, consumer3);

        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      });
    });
  });
});
