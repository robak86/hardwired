import { container } from '../../container/Container';
import { createResolverId } from '../../utils/fastId';
import { unit } from '../../module/ModuleBuilder';
import { singleton, SingletonStrategy } from '../SingletonStrategy';
import { expectType, TypeEqual } from 'ts-expect';

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
      const s = singleton(() => new TestClass(''));
      expectType<TypeEqual<typeof s, SingletonStrategy<TestClass>>>(true);
    });
  });

  describe(`single module`, () => {
    const m = unit()
      .define('someValue', () => 'someString', singleton)
      .define('a', ctx => new TestClass(ctx.someValue))
      .freeze();

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
        ({ singletonModule }) => new TestClassConsumer(singletonModule.theSingleton),
        singleton,
      )
      .freeze();

    const child1 = unit()
      .import('singletonModule', () => singletonModule)
      .define(
        'singletonConsumer',
        ({ singletonModule }) => new TestClassConsumer(singletonModule.theSingleton),
        singleton,
      )
      .freeze();

    const child2 = unit()
      .import('singletonModule', () => singletonModule)
      .define(
        'singletonConsumer',
        ({ singletonModule }) => new TestClassConsumer(singletonModule.theSingleton),
        singleton,
      )
      .freeze();

    const singletonModule = unit()
      .define('value', () => 'someValue')
      .define('theSingleton', ctx => new TestClass(ctx.value))
      .freeze();

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
        .define('someValue', () => 'someString')
        .define('a', _ => new TestClass(_.someValue), singleton)
        .freeze();

      const c1 = container();
      const instanceFromC1 = c1.get(m, 'a');

      const c2 = container();
      const instanceFromC2 = c2.get(m, 'a');
      expect(instanceFromC1.id).not.toEqual(instanceFromC2.id);
    });
  });
});
