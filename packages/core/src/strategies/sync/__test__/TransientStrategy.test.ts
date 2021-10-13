import { container } from '../../../container/Container';
import { v4 } from 'uuid';
import { transient } from '../../../definitions/definitions';
import { value } from '../../../definitions/sync/value';
import { InstanceDefinition } from '../../../definitions/abstract/InstanceDefinition';

describe(`ClassTransientResolver`, () => {
  class TestClass {
    public id = v4();

    constructor(public value: string) {}
  }

  const someValue = value('someString');
  const a = transient.class(TestClass, someValue);

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
