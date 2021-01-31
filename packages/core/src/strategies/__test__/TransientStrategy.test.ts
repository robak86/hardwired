import { container } from '../../container/Container';
import { createResolverId } from '../../utils/fastId';
import { unit } from '../../module/ModuleBuilder';
import { transient } from '../TransientStrategy';

describe(`ClassTransientResolver`, () => {
  class TestClass {
    public id = createResolverId();

    constructor(public value: string) {}
  }

  describe(`transient`, () => {
    // it(`return Instance type`, async () => {
    //   const s = transient(TestClass);
    //   expectType<TypeEqual<typeof s, Instance<TestClass, [string]>>>(true);
    // });
  });

  const m = unit()
    .define('someValue', () => 'someString')
    .define('a', c => new TestClass(c.someValue), transient)
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
