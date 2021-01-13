import { transient } from '../ClassTransientResolver';
import { dependency } from '../../testing/TestResolvers';
import { container } from '../../container/Container';
import { createResolverId } from '../../utils/fastId';
import { expectType, TypeEqual } from 'ts-expect';
import { unit } from '../../module/ModuleBuilder';
import { Instance } from '../abstract/Instance';

describe(`ClassTransientResolver`, () => {
  class TestClass {
    public id = createResolverId();

    constructor(public value: string) {}
  }

  describe(`transient`, () => {
    it(`return Instance type`, async () => {
      const s = transient(TestClass);
      expectType<TypeEqual<typeof s, Instance<TestClass, [string]>>>(true);
    });
  });

  const m = unit('root').define('someValue', dependency('someString')).define('a', transient(TestClass), ['someValue']);

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
