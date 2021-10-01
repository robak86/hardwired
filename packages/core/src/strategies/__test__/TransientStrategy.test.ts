import { container } from '../../container/Container';
import { createModuleId } from '../../utils/fastId';
import { moduleNew } from '../../module/ModuleBuilder';
import { classTransient, value } from '../../new/classStrategies';

describe(`ClassTransientResolver`, () => {
  class TestClass {
    public id = createModuleId();

    constructor(public value: string) {}
  }

  const m = moduleNew(() => {
    const someValue = value('someString');
    const a = classTransient(TestClass, [someValue]);

    return {
      someValue,
      a,
    };
  });

  it(`returns class instance`, async () => {
    const c = container();
    expect(c.__get(m.a)).toBeInstanceOf(TestClass);
  });

  it(`constructs class with correct dependencies`, async () => {
    const c = container();
    const instance = c.__get(m.a);
    expect(instance.value).toEqual('someString');
  });

  it(`caches class instance`, async () => {
    const c = container();
    const instance = c.__get(m.a);
    const instance2 = c.__get(m.a);
    expect(instance).not.toBe(instance2);
  });
});
