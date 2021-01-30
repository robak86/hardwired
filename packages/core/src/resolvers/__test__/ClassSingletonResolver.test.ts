import { singleton } from '../ClassSingletonResolver';
import { dependency } from '../../__test__/TestResolvers';
import { container } from '../../container/Container';
import { createResolverId } from '../../utils/fastId';
import { value } from '../ValueResolver';
import { transient } from '../ClassTransientResolver';
import { expectType, TypeEqual } from 'ts-expect';
import { unit } from '../../module/ModuleBuilder';
import { Instance } from '../abstract/Instance';

describe(`ClassSingletonResolver`, () => {
  class TestClass {
    public id = createResolverId();

    constructor(public value: string) {}
  }

  class TestClassConsumer {
    constructor(public testClassInstance: TestClass) {}
  }

  describe(`singleton`, () => {
    it(`return Instance type`, async () => {
      const s = singleton(TestClass);
      expectType<TypeEqual<typeof s, Instance<TestClass, [string]>>>(true);
    });
  });

  describe(`single module`, () => {
    const m = unit('root')
      .define('someValue', dependency('someString'))
      .define('a', singleton(TestClass), ['someValue']);

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
    const root = unit('root')
      .import('child1', () => child1)
      .import('child2', () => child2)

      .import('singletonModule', () => singletonModule)
      .define('singletonConsumer', transient(TestClassConsumer), ['singletonModule.theSingleton']);

    const child1 = unit('child1')
      .import('singletonModule', () => singletonModule)
      .define('singletonConsumer', transient(TestClassConsumer), ['singletonModule.theSingleton']);

    const child2 = unit('child2')
      .import('singletonModule', () => singletonModule)
      .define('singletonConsumer', transient(TestClassConsumer), ['singletonModule.theSingleton']);

    const singletonModule = unit('child1')
      .define('value', value('someValue'))
      .define('theSingleton', singleton(TestClass), ['value']);

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
      const m = unit('root')
        .define('someValue', dependency('someString'))
        .define('a', singleton(TestClass), ['someValue']);

      const c1 = container();
      const instanceFromC1 = c1.get(m, 'a');

      const c2 = container();
      const instanceFromC2 = c2.get(m, 'a');
      expect(instanceFromC1.id).not.toEqual(instanceFromC2.id);
    });
  });
});
