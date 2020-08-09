import { module } from "../../builders/ModuleBuilder";
import { dependency } from "../../testing/TestResolvers";
import { container } from "../Container";
import { moduleImport } from "../../resolvers/ModuleResolver";

// TODO: write correct tests not depending on any DependencyResolver implementation
describe(`Container`, () => {
  describe(`.get`, () => {
    it(`return correct value`, async () => {
      const m = module('root').define('a', _ => dependency(123));
      const c = container(m);
      const a = c.get('a');
      expect(a).toEqual(123);
    });
  });

  describe(`.deepGet`, () => {
    const child = module('child')
      .define('a', _ => dependency('aValue'))
      .define('b', _ => dependency('bValue'));

    const child2 = module('child')
      .define('c', _ => dependency('cValue'))
      .define('d', _ => dependency('dValue'));

    const parent = module('parent')
      .define('child1', _ => moduleImport(child))
      .define('child2', _ => moduleImport(child2));

    it(`returns correct value`, async () => {
      const c = container(parent);

      const cValue = c.deepGet(child2, 'c');
      expect(cValue).toEqual('cValue');
    });

    it(`throws if module cannot be found`, async () => {
      const notRegistered = module('notUsed') // breakme
        .define('a', _ => dependency(1));

      const c = container(parent);

      expect(() => c.deepGet(notRegistered, 'a')).toThrow();
    });
  });
});
