import { transient } from "../ClassTransientResolver";
import { dependency } from "../../testing/TestResolvers";
import { container } from "../../container/Container";
import { createResolverId } from "../../utils/fastId";
import { unit } from "../../module/Module";
import { expectType, TypeEqual } from "ts-expect";
import { Instance } from "../abstract/AbstractResolvers";

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
    const c = container(m);
    expect(c.get('a')).toBeInstanceOf(TestClass);
  });

  it(`constructs class with correct dependencies`, async () => {
    const c = container(m);
    const instance = c.get('a');
    expect(instance.value).toEqual('someString');
  });

  it(`caches class instance`, async () => {
    const c = container(m);
    const instance = c.get('a');
    const instance2 = c.get('a');
    expect(instance).not.toBe(instance2);
  });
});
