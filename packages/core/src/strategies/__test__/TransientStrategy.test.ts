import { container } from '../../container/Container';

import { classTransient } from '../factory/classStrategies';
import { v4 } from 'uuid';
import { value } from '../factory/strategies';

describe(`ClassTransientResolver`, () => {
  class TestClass {
    public id = v4();

    constructor(public value: string) {}
  }

  const someValue = value('someString');
  const a = classTransient(TestClass, someValue);

  it(`returns class instance`, async () => {
    const c = container();
    expect(c.get(a)).toBeInstanceOf(TestClass);
  });

  it(`constructs class with correct dependencies`, async () => {
    const c = container();
    const instance = c.get(a);
    expect(instance.value).toEqual('someString');
  });

  it(`caches class instance`, async () => {
    const c = container();
    const instance = c.get(a);
    const instance2 = c.get(a);
    expect(instance).not.toBe(instance2);
  });
});
