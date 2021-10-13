import { container } from '../../../container/Container';
import { set } from '../../../patching/set';
import { v4 } from 'uuid';
import { singleton} from '../../../definitions/definitions';
import { value } from "../../../definitions/sync/value";

describe(`SingletonStrategy`, () => {
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
      const a = singleton.class(TestClass, someValue, );

      it(`returns class instance`, async () => {
        const c = container();
        expect(c.get(a)).toBeInstanceOf(TestClass);
      });

      it(`constructs class with correct dependencies`, async () => {
        const c = container();
        const instance = c.get(a);
        expect(instance.value).toEqual('someString');
      });

      it(`caches class instance`, async () => {
        const c = container();
        const instance = c.get(a);
        const instance2 = c.get(a);
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
      const theSingleton = singleton.class(TestClass, someValue);

      const rootSingletonConsumer = singleton.class(TestClassConsumer, theSingleton);
      const child1SingletonConsumer = singleton.class(TestClassConsumer, theSingleton);
      const child2SingletonConsumer = singleton.class(TestClassConsumer, theSingleton);

      it(`reuses the same instance`, async () => {
        const c = container();
        const consumerFromRoot = c.get(rootSingletonConsumer);
        const consumerFromChild1 = c.get(child1SingletonConsumer);
        const consumerFromChild2 = c.get(child2SingletonConsumer);
        const theSingletonInstance = c.get(theSingleton);
        expect(consumerFromChild1.testClassInstance.id).toEqual(theSingletonInstance.id);
        expect(consumerFromChild2.testClassInstance.id).toEqual(theSingletonInstance.id);
        expect(consumerFromRoot.testClassInstance.id).toEqual(theSingletonInstance.id);
      });

      it(`reuses the same instance for lazily loaded modules`, async () => {
        const c = container();

        const consumerFromChild1 = c.get(child1SingletonConsumer);
        const consumerFromChild2 = c.get(child2SingletonConsumer);
        const theSingletonInstance = c.get(theSingleton);
        expect(consumerFromChild1.testClassInstance.id).toEqual(theSingletonInstance.id);
        expect(consumerFromChild2.testClassInstance.id).toEqual(theSingletonInstance.id);
      });
    });

    describe(`multiple containers`, () => {
      it(`does not shares instances across multiple containers`, async () => {
        const someValue = value('someString');
        const a = singleton.class(TestClass, someValue);

        const c1 = container();
        const instanceFromC1 = c1.get(a);

        const c2 = container();
        const instanceFromC2 = c2.get(a);
        expect(instanceFromC1.id).not.toEqual(instanceFromC2.id);
      });
    });

    describe(`container scopes`, () => {});
  });

  describe(`scope overrides`, () => {
    it(`replaces definitions for singleton scope`, async () => {
      const a = value(1);

      const c = container();

      const patchedA = set(a, 2);
      const childC = c.checkoutScope({ scopeOverrides: [patchedA] });

      expect(childC.get(a)).toEqual(2);
      expect(c.get(a)).toEqual(1);
    });

    it(`inherits singleton instance from parent scope`, async () => {
      const a = value(1);

      const root = container();

      const patchedA = set(a, 2);

      const level1 = root.checkoutScope({ scopeOverrides: [patchedA] });
      const level2 = level1.checkoutScope();

      expect(level2.get(a)).toEqual(2);
      expect(root.get(a)).toEqual(1);
    });

    it(`propagates singletons created in child scope to parent scope (if not replaced with patches)`, async () => {
      const a = singleton.fn(() => Math.random());

      const parentC = container();
      const childC = parentC.checkoutScope();

      const req1 = childC.get(a); // important that childC is called as first
      const req2 = parentC.get(a);
      expect(req1).toEqual(req2);
    });

    it(`propagates singletons created in descendent scope to first ascendant scope which does not overrides definition`, async () => {
      const randomFactorySpy: () => number = jest.fn().mockImplementation(() => Math.random());

      const a = singleton.fn(randomFactorySpy);

      const root = container();
      const level1 = root.checkoutScope();
      const level2 = level1.checkoutScope({ scopeOverrides: [set(a, 1)] });
      const level3 = level2.checkoutScope();

      const level3Call = level3.get(a); // important that level1 is called as first
      const level2Call = level2.get(a);
      const level1Call = level1.get(a);
      const rootCall = root.get(a);

      expect(level1Call).toEqual(rootCall);
      expect(level2Call).toEqual(1);
      expect(level3Call).toEqual(1);
      expect(randomFactorySpy).toHaveBeenCalledTimes(1);
    });

    it(`does not propagate singletons created in descendent scope to ascendant scopes if all ascendant scopes has patched value`, async () => {
      const randomFactorySpy: () => number = jest.fn().mockImplementation(() => Math.random());

      const a = singleton.fn(randomFactorySpy);

      const root = container();
      const level1 = root.checkoutScope({ scopeOverrides: [set(a, 1)] });
      const level2 = level1.checkoutScope({ scopeOverrides: [set(a, 2)] });
      const level3 = level2.checkoutScope();

      const level3Call = level3.get(a); // important that level1 is called as first
      const level2Call = level2.get(a);
      const level1Call = level1.get(a);
      const rootCall = root.get(a);

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

      const c = container({ globalOverrides: [invariantPatch] });
      expect(c.get(k1)).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(childScope.get(k1)).toEqual(1);
    });

    it(`allows for overrides for other keys than ones changes invariants array`, async () => {
      const k1 = singleton.fn(() => Math.random());
      const k2 = singleton.fn(() => Math.random());

      const invariantPatch = set(k1, 1);
      const childScopePatch = set(k2, 2);

      const c = container({ globalOverrides: [invariantPatch] });
      expect(c.getAll(k1, k2)[0]).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(childScope.getAll(k1, k2)[0]).toEqual(1);
      expect(childScope.getAll(k1, k2)[1]).toEqual(2);
    });
  });
});
