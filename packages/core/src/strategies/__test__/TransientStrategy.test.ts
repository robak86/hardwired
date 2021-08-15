import { container } from '../../container/Container';
import { createModuleId } from '../../utils/fastId';
import { unit } from '../../module/ModuleBuilder';
import { transient } from '../TransientStrategy';
import { singleton } from '../SingletonStrategy';

describe(`ClassTransientResolver`, () => {
  class TestClass {
    public id = createModuleId();

    constructor(public value: string) {}
  }

  const m = unit()
    .define('someValue', singleton, () => 'someString')
    .define('a', transient, c => new TestClass(c.someValue))
    .build();

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
    expect(instance).not.toBe(instance2);
  });
});
