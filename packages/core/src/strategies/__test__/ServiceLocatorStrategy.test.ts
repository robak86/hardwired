import { createModuleId } from '../../utils/fastId';
import { container } from '../../container/Container';
import { expectType, TypeEqual } from 'ts-expect';
import { ServiceLocator } from '../../container/ServiceLocator';
import { request } from '../RequestStrategyLegacy';
import { singleton } from '../SingletonStrategyLegacy';
import { BuildStrategy } from '../abstract/BuildStrategy';

describe(`ServiceLocatorResolver`, () => {
  class TestClass {
    public id = createModuleId();

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
    .define('producedByFactory', singleton, () => new DummyFactory())
    .define('singletonConsumer', request, ({ singletonModule }) => new TestClassConsumer(singletonModule.reqScoped))
    .build();

  const singletonModule = unit()
    .define('value', singleton, () => 'someValue')
    .define('reqScoped', request, c => new TestClass(c.value))
    .define('singleton', singleton, c => new TestClass(c.value))
    .build();

  describe(`serviceLocator`, () => {
    it(`return Instance type`, async () => {
      const s = serviceLocator();
      expectType<TypeEqual<typeof s, BuildStrategy<ServiceLocator>>>(true);
    });
  });

  it(`returns request scoped instances`, async () => {
    const c = container();
    const locator = c.get(root, 'locator');

    locator.withRequestScope(({ get }) => {
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
    const fromLocator = locator.withRequestScope(({ get }) => {
      return get(singletonModule, 'singleton');
    });

    expect(fromContainer).toBe(fromLocator);
  });

  it(`reuses values built by factories from container`, async () => {
    const c = container();
    const locator = c.get(root, 'locator');

    const fromContainer = c.get(root, 'producedByFactory');
    const fromLocator = locator.withRequestScope(({ get }) => {
      return get(root, 'producedByFactory');
    });
    const fromContainer2 = c.get(root, 'producedByFactory');

    expect(fromContainer).toBe(fromLocator);
    expect(fromContainer2).toBe(fromLocator);
  });
});
