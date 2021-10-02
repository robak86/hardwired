import { container } from '../../container/Container';
import { createModuleId } from '../../utils/fastId';

import { classTransient, value } from '../../new/classStrategies';

describe(`ClassTransientResolver`, () => {
  class TestClass {
    public id = createModuleId();

    constructor(public value: string) {}
  }

  const someValue = value('someString');
  const a = classTransient(TestClass, [someValue]);

  it(`returns class instance`, async () => {
    const c = container();
    expect(c.__get(a)).toBeInstanceOf(TestClass);
  });

  it(`constructs class with correct dependencies`, async () => {
    const c = container();
    const instance = c.__get(a);
    expect(instance.value).toEqual('someString');
  });

  it(`caches class instance`, async () => {
    const c = container();
    const instance = c.__get(a);
    const instance2 = c.__get(a);
    expect(instance).not.toBe(instance2);
  });
});
