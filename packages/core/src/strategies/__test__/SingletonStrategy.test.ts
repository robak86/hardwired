import { container } from '../../container/Container';
import { createModuleId } from '../../utils/fastId';
import { module, unit } from '../../module/ModuleBuilder';
import { singleton, SingletonStrategy } from '../SingletonStrategy';
import { expectType, TypeEqual } from 'ts-expect';

describe(`SingletonStrategy`, () => {
  class TestClass {
    public id = createModuleId();

    constructor(public value: string) {}
  }

  class TestClassConsumer {
    constructor(public testClassInstance: TestClass) {}
  }

  describe(`types`, () => {
    it(`return correct type`, async () => {
      const s = singleton(() => new TestClass(''));
      expectType<TypeEqual<typeof s, SingletonStrategy<TestClass>>>(true);
    });
  });

  describe(`resolution`, () => {
    describe(`single module`, () => {
      const m = unit()
        .define('someValue', singleton, () => 'someString')
        .define('a', singleton, ctx => new TestClass(ctx.someValue))
        .build();

      it(`returns class instance`, async () => {
        const c = container();
        expect(c.get(m, 'a')).toBeInstanceOf(TestClass);
      });

      it(`constructs class with correct dependencies`, async () => {
        const c = container();
        const instance = c.get(m, 'a');
        expect(instance.value).toEqual('someString');
      });

      it(`caches class instance`, async () => {
        const c = container();
        const instance = c.get(m, 'a');
        const instance2 = c.get(m, 'a');
        expect(instance).toBe(instance2);
      });
    });

    describe(`singleton shared across multiple modules hierarchy`, () => {
      const root = unit()
        .import('child1', () => child1)
        .import('child2', () => child2)

        .import('singletonModule', () => singletonModule)
        .define(
          'singletonConsumer',
          singleton,
          ({ singletonModule }) => new TestClassConsumer(singletonModule.theSingleton),
        )
        .build();

      const child1 = unit()
        .import('singletonModule', () => singletonModule)
        .define(
          'singletonConsumer',
          singleton,
          ({ singletonModule }) => new TestClassConsumer(singletonModule.theSingleton),
        )
        .build();

      const child2 = unit()
        .import('singletonModule', () => singletonModule)
        .define(
          'singletonConsumer',
          singleton,
          ({ singletonModule }) => new TestClassConsumer(singletonModule.theSingleton),
        )
        .build();

      const singletonModule = unit()
        .define('value', singleton, () => 'someValue')
        .define('theSingleton', singleton, ctx => new TestClass(ctx.value))
        .build();

      it(`reuses the same instance`, async () => {
        const c = container();
        const consumerFromRoot = c.get(root, 'singletonConsumer');
        const consumerFromChild1 = c.get(child1, 'singletonConsumer');
        const consumerFromChild2 = c.get(child2, 'singletonConsumer');
        const theSingleton = c.get(singletonModule, 'theSingleton');
        expect(consumerFromChild1.testClassInstance.id).toEqual(theSingleton.id);
        expect(consumerFromChild2.testClassInstance.id).toEqual(theSingleton.id);
        expect(consumerFromRoot.testClassInstance.id).toEqual(theSingleton.id);
      });

      it(`reuses the same instance for lazily loaded modules`, async () => {
        const c = container();

        const consumerFromChild1 = c.get(child1, 'singletonConsumer');
        const consumerFromChild2 = c.get(child2, 'singletonConsumer');
        const theSingleton = c.get(singletonModule, 'theSingleton');
        expect(consumerFromChild1.testClassInstance.id).toEqual(theSingleton.id);
        expect(consumerFromChild2.testClassInstance.id).toEqual(theSingleton.id);
      });
    });

    describe(`multiple containers`, () => {
      it(`does not shares instances across multiple containers`, async () => {
        const m = unit()
          .define('someValue', singleton, () => 'someString')
          .define('a', singleton, _ => new TestClass(_.someValue))
          .build();

        const c1 = container();
        const instanceFromC1 = c1.get(m, 'a');

        const c2 = container();
        const instanceFromC2 = c2.get(m, 'a');
        expect(instanceFromC1.id).not.toEqual(instanceFromC2.id);
      });
    });

    describe(`container scopes`, () => {});
  });

  describe(`scope overrides`, () => {
    it(`replaces definitions for singleton scope`, async () => {
      const m = unit()
        .define('a', singleton, () => 1)
        .build();
      const c = container();

      const mPatch = m.replace('a', () => 2, singleton);
      const childC = c.checkoutScope({ scopeOverrides: [mPatch] });

      expect(childC.get(m, 'a')).toEqual(2);
      expect(c.get(m, 'a')).toEqual(1);
    });

    it(`inherits singleton instance from parent scope`, async () => {
      const m = unit()
        .define('a', singleton, () => 1)
        .build();
      const root = container();

      const patch = m.replace('a', () => 2, singleton);
      const level1 = root.checkoutScope({ scopeOverrides: [patch] });
      const level2 = level1.checkoutScope();

      expect(level2.get(m, 'a')).toEqual(2);
      expect(root.get(m, 'a')).toEqual(1);
    });

    it(`propagates singletons created in child scope to parent scope (if not replaced with patches)`, async () => {
      const m = unit()
        .define('a', singleton, () => Math.random())
        .build();
      const parentC = container();
      const childC = parentC.checkoutScope();

      const req1 = childC.get(m, 'a'); // important that childC is called as first
      const req2 = parentC.get(m, 'a');
      expect(req1).toEqual(req2);
    });

    it(`propagates singletons created in descendent scope to first ascendant scope which does not overrides definition`, async () => {
      const randomFactorySpy = jest.fn().mockImplementation(() => Math.random());

      const m = unit().define('a', singleton, randomFactorySpy).build();

      const root = container();
      const level1 = root.checkoutScope();
      const level2 = level1.checkoutScope({ scopeOverrides: [m.replace('a', () => 1)] });
      const level3 = level2.checkoutScope();

      const level3Call = level3.get(m, 'a'); // important that level1 is called as first
      const level2Call = level2.get(m, 'a');
      const level1Call = level1.get(m, 'a');
      const rootCall = root.get(m, 'a');

      expect(level1Call).toEqual(rootCall);
      expect(level2Call).toEqual(1);
      expect(level3Call).toEqual(1);
      expect(randomFactorySpy).toHaveBeenCalledTimes(1);
    });

    it(`does not propagate singletons created in descendent scope to ascendant scopes if all ascendant scopes has patched value`, async () => {
      const randomFactorySpy = jest.fn().mockImplementation(() => Math.random());

      const m = unit().define('a', singleton, randomFactorySpy).build();

      const root = container();
      const level1 = root.checkoutScope({ scopeOverrides: [m.replace('a', () => 1)] });
      const level2 = level1.checkoutScope({ scopeOverrides: [m.replace('a', () => 2)] });
      const level3 = level2.checkoutScope();

      const level3Call = level3.get(m, 'a'); // important that level1 is called as first
      const level2Call = level2.get(m, 'a');
      const level1Call = level1.get(m, 'a');
      const rootCall = root.get(m, 'a');

      expect(level3Call).toEqual(level2Call);
      expect(level2Call).toEqual(2);
      expect(level1Call).toEqual(1);
      expect(rootCall).not.toEqual(level3);
      expect(randomFactorySpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('global overrides', function () {
    it(`cannot be replaced by overrides`, async () => {
      const m = module()
        .define('k1', singleton, () => Math.random())
        .build();

      const invariantPatch = m.replace('k1', () => 1, singleton);
      const childScopePatch = m.replace('k1', () => 2, singleton);

      const c = container({ globalOverrides: [invariantPatch] });
      expect(c.asObject(m).k1).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(childScope.asObject(m).k1).toEqual(1);
    });

    it(`allows for overrides for other keys than ones changes invariants array`, async () => {
      const m = module()
        .define('k1', singleton, () => Math.random())
        .define('k2', singleton, () => Math.random())
        .build();

      const invariantPatch = m.replace('k1', () => 1, singleton);
      const childScopePatch = m.replace('k2', () => 2, singleton);

      const c = container({ globalOverrides: [invariantPatch] });
      expect(c.asObject(m).k1).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(childScope.asObject(m).k1).toEqual(1);
      expect(childScope.asObject(m).k2).toEqual(2);
    });
  });
});
