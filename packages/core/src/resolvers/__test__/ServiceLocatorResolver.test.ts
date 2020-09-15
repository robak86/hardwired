import { unit } from "../../module/Module";
import { value } from "../ValueResolver";
import { createResolverId } from "../../utils/fastId";
import { request } from "../ClassRequestResolver";
import { moduleImport } from "../ModuleResolver";
import { singleton } from "../ClassSingletonResolver";
import { serviceLocator } from "../ServiceLocatorResolver";
import { container } from "../../container/Container";
import { factory } from "../FactoryResolver";

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
    .define('locator', _ => serviceLocator())

    .define('singletonModule', _ => moduleImport(singletonModule))
    .define('producedByFactory', _ => factory(DummyFactory))
    .define('singletonConsumer', _ => request(TestClassConsumer, [_.singletonModule.reqScoped]));

  const singletonModule = unit('child1')
    .define('value', _ => value('someValue'))
    .define('reqScoped', _ => request(TestClass, [_.value]))
    .define('singleton', _ => singleton(TestClass, [_.value]));

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