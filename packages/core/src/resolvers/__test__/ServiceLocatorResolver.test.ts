import { unit } from '../../module/Module';
import { value, valueNew } from '../ValueResolver';
import { createResolverId } from '../../utils/fastId';
import { request, requestNew } from '../ClassRequestResolver';
import { singleton, singletonNew } from '../ClassSingletonResolver';
import { serviceLocator, serviceLocatorNew } from '../ServiceLocatorResolver';
import { container } from '../../container/Container';
import { factory, factoryNew } from '../FactoryResolver';
import { moduleImport } from '../../module/ModuleBuilder';

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

  const root = unit('root')
    .define('locator', serviceLocatorNew())

    .define(
      'singletonModule',
      moduleImport(() => singletonModule),
    )
    .define('producedByFactory', factoryNew(DummyFactory))
    .define('singletonConsumer', requestNew(TestClassConsumer), ['singletonModule.reqScoped']);

  const singletonModule = unit('child1')
    .define('value', valueNew('someValue'))
    .define('reqScoped', requestNew(TestClass), ['value'])
    .define('singleton', singletonNew(TestClass), ['value']);

  it(`returns request scoped instances`, async () => {
    const c = container(root);
    const locator = c.get('locator');

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
    const c = container(root);
    const locator = c.get('locator');

    const fromContainer = c.get(singletonModule, 'singleton');
    const fromLocator = locator.withScope(({ get }) => {
      return get(singletonModule, 'singleton');
    });

    expect(fromContainer).toBe(fromLocator);
  });

  it(`reuses values built by factories from container`, async () => {
    const c = container(root);
    const locator = c.get('locator');

    const fromContainer = c.get(root, 'producedByFactory');
    const fromLocator = locator.withScope(({ get }) => {
      return get(root, 'producedByFactory');
    });
    const fromContainer2 = c.get(root, 'producedByFactory');

    expect(fromContainer).toBe(fromLocator);
    expect(fromContainer2).toBe(fromLocator);
  });
});
