import { singleton } from "../ClassSingletonResolver";
import { dependency } from "../../testing/TestResolvers";
import { container } from "../../container/Container";
import { createResolverId } from "../../utils/fastId";
import { unit } from "../../module/Module";
import { value } from "../ValueResolver";
import { transient } from "../ClassTransientResolver";
import { moduleImport } from "../../module/ModuleBuilder";

describe(`ClassSingletonResolver`, () => {
  class TestClass {
    public id = createResolverId();

    constructor(public value: string) {}
  }

  class TestClassConsumer {
    constructor(public testClassInstance: TestClass) {}
  }

  describe(`single module`, () => {
    const m = unit('root')
      .define('someValue', dependency('someString'))
      .define('a', singleton(TestClass), ['someValue']);

    it(`returns class instance`, async () => {
      const c = container(m);
      expect(c.get('a')).toBeInstanceOf(TestClass);
    });

    it(`constructs class with correct dependencies`, async () => {
      const c = container(m);
      const instance = c.get('a');
      expect(instance.value).toEqual('someString');
    });

    it(`caches class instance`, async () => {
      const c = container(m);
      const instance = c.get('a');
      const instance2 = c.get('a');
      expect(instance).toBe(instance2);
    });
  });

  describe(`singleton shared across multiple modules hierarchy`, () => {
    const root = unit('root')
      .define(
        'child1',
        moduleImport(() => child1),
      )
      .define(
        'child2',
        moduleImport(() => child2),
      )

      .define(
        'singletonModule',
        moduleImport(() => singletonModule),
      )
      .define('singletonConsumer', transient(TestClassConsumer), ['singletonModule.theSingleton']);

    const child1 = unit('child1')
      .define(
        'singletonModule',
        moduleImport(() => singletonModule),
      )
      .define('singletonConsumer', transient(TestClassConsumer), ['singletonModule.theSingleton']);

    const child2 = unit('child2')
      .define(
        'singletonModule',
        moduleImport(() => singletonModule),
      )
      .define('singletonConsumer', transient(TestClassConsumer), ['singletonModule.theSingleton']);

    const singletonModule = unit('child1')
      .define('value', value('someValue'))
      .define('theSingleton', singleton(TestClass), ['value']);

    it(`reuses the same instance`, async () => {
      const c = container(root);
      const consumerFromRoot = c.get('singletonConsumer');
      const consumerFromChild1 = c.get(child1, 'singletonConsumer');
      const consumerFromChild2 = c.get(child2, 'singletonConsumer');
      const theSingleton = c.get(singletonModule, 'theSingleton');
      expect(consumerFromChild1.testClassInstance.id).toEqual(theSingleton.id);
      expect(consumerFromChild2.testClassInstance.id).toEqual(theSingleton.id);
      expect(consumerFromRoot.testClassInstance.id).toEqual(theSingleton.id);
    });

    it(`reuses the same instance for lazily loaded modules`, async () => {
      const c = container(unit('emptyModule'));

      const consumerFromChild1 = c.get(child1, 'singletonConsumer');
      const consumerFromChild2 = c.get(child2, 'singletonConsumer');
      const theSingleton = c.get(singletonModule, 'theSingleton');
      expect(consumerFromChild1.testClassInstance.id).toEqual(theSingleton.id);
      expect(consumerFromChild2.testClassInstance.id).toEqual(theSingleton.id);
    });
  });
});
