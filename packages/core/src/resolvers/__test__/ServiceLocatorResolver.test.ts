import { createResolverId } from '../../utils/fastId';
import { serviceLocator } from '../ServiceLocatorResolver';
import { container } from '../../container/Container';
import { unit } from '../../module/ModuleBuilder';
import { expectType, TypeEqual } from 'ts-expect';
import { ServiceLocator } from '../../container/ServiceLocator';
import { Instance } from '../abstract/Instance';
import { request } from '../../strategies/RequestStrategy';
import { singleton } from '../../strategies/SingletonStrategy';

describe(`ServiceLocatorResolver`, () => {
  class TestClass {
    public id = createResolverId();

    constructor(public value: string) {}
  }

  class TestClassConsumer {
    constructor(public testClassInstance: TestClass) {}
  }

  class DummyFactory {
    build() {
      return new TestClass('');
    }
  }

  const root = unit()
    .define('locator', serviceLocator())
    .import('singletonModule', () => singletonModule)
    .define('producedByFactory', () => new DummyFactory())
    .define('singletonConsumer', ({ singletonModule }) => new TestClassConsumer(singletonModule.reqScoped), request)
    .build();

  const singletonModule = unit()
    .define('value', () => 'someValue')
    .define('reqScoped', c => new TestClass(c.value), request)
    .define('singleton', c => new TestClass(c.value), singleton)
    .build();

  describe(`serviceLocator`, () => {
    it(`return Instance type`, async () => {
      const s = serviceLocator();
      expectType<TypeEqual<typeof s, Instance<ServiceLocator, []>>>(true);
    });
  });

  it(`returns request scoped instances`, async () => {
    const c = container();
    const locator = c.get(root, 'locator');

    const fromLocator = locator.withScope(({ get }) => {
      const call1 = get(singletonModule, 'singleton');
      const call2 = get(singletonModule, 'singleton');

      const req1 = get(root, 'singletonConsumer');
      const req3 = get(root, 'singletonConsumer');

      expect(call1).toBe(call2);
      expect(req1).toBe(req3);
    });
  });

  it(`reuses singleton instances from container`, async () => {
    const c = container();

    const locator = c.get(root, 'locator');

    const fromContainer = c.get(singletonModule, 'singleton');
    const fromLocator = locator.withScope(({ get }) => {
      return get(singletonModule, 'singleton');
    });

    expect(fromContainer).toBe(fromLocator);
  });

  it(`reuses values built by factories from container`, async () => {
    const c = container();
    const locator = c.get(root, 'locator');

    const fromContainer = c.get(root, 'producedByFactory');
    const fromLocator = locator.withScope(({ get }) => {
      return get(root, 'producedByFactory');
    });
    const fromContainer2 = c.get(root, 'producedByFactory');

    expect(fromContainer).toBe(fromLocator);
    expect(fromContainer2).toBe(fromLocator);
  });
});
