import { createModuleId } from '../../utils/fastId';
import { container } from '../../container/Container';
import { request, serviceLocator, singleton } from '../../new/singletonStrategies';
import { value } from '../../new/classStrategies';

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

  const someValue = value('someValue');
  const reqScoped = request.class(TestClass, [someValue]);
  const singletonScoped = singleton.class(TestClass, [someValue]);

  const producedByFactory = singleton.fn(() => new DummyFactory());
  const singletonConsumer = singleton.class(TestClassConsumer, [reqScoped]);

  it(`returns request scoped instances`, async () => {
    const c = container();
    const locator = c.__get(serviceLocator);

    locator.withRequestScope(({ get }) => {
      const call1 = get(singletonScoped);
      const call2 = get(singletonScoped);

      const req1 = get(singletonConsumer);
      const req3 = get(singletonConsumer);

      expect(call1).toBe(call2);
      expect(req1).toBe(req3);
    });
  });

  it(`reuses singleton instances from container`, async () => {
    const c = container();

    const locator = c.__get(serviceLocator);

    const fromContainer = c.__get(singletonScoped);
    const fromLocator = locator.withRequestScope(({ get }) => {
      return get(singletonScoped);
    });

    expect(fromContainer).toBe(fromLocator);
  });

  it(`reuses values built by factories from container`, async () => {
    const c = container();
    const locator = c.__get(serviceLocator);

    const fromContainer = c.__get(producedByFactory);
    const fromLocator = locator.withRequestScope(({ get }) => {
      return get(producedByFactory);
    });
    const fromContainer2 = c.__get(producedByFactory);

    expect(fromContainer).toBe(fromLocator);
    expect(fromContainer2).toBe(fromLocator);
  });
});
