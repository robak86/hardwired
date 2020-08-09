import { singleton } from "../ClassSingletonResolver";
import { dependency } from "../../testing/TestResolvers";
import { container } from "../../container/Container";
import { createResolverId } from "../../utils/fastId";
import { unit } from "../../builders/ModuleBuilder";

describe(`ClassSingletonResolver`, () => {
  class TestClass {
    public id = createResolverId();

    constructor(public value: string) {}
  }

  const m = unit('root')
    .define('someValue', _ => dependency('someString'))
    .define('a', _ => singleton(TestClass, [_.someValue]));

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
    expect(instance).toBe(instance2);
  });
});
