import { module } from "../../module/Module";
import { dependency } from "../../testing/TestResolvers";
import { container } from "../Container";
import { value } from "../../resolvers/ValueResolver";
import { singleton } from "../../resolvers/ClassSingletonResolver";
import { ArgsDebug } from "../../testing/ArgsDebug";

describe(`Container`, () => {
  describe(`.get`, () => {
    it(`return correct value`, async () => {
      const m = module('root').define('a', dependency(123));
      const c = container(m);
      const a = c.get('a');
      expect(a).toEqual(123);
    });
  });

  describe(`.get using module-key pairs`, () => {
    const child = module('child').define('a', dependency('aValue')).define('b', dependency('bValue'));

    const child2 = module('child').define('c', dependency('cValue')).define('d', dependency('dValue'));

    const parent = module('parent')
      .define('child1', () => child)
      .define('child2', () => child2);

    it(`returns correct value`, async () => {
      const c = container(parent);

      const cValue = c.get(child2, 'c');
      expect(cValue).toEqual('cValue');
    });

    it(`lazily appends new module if module cannot be found`, async () => {
      const notRegistered = module('notUsed') // breakme
        .define('a', dependency(1));

      const c = container(parent);

      expect(c.get(notRegistered, 'a')).toEqual(1);
    });
  });

  describe(`replacing definitions`, () => {
    describe(`using module.replace`, () => {
      it(`returns replaced value`, async () => {
        const m = module('m').define('a', value(1));
        const updated = m.replace('a', value(2));
        expect(container(updated).get('a')).toEqual(2);
      });

      it(`does not affect other definitions`, async () => {
        const m = module('m').define('a', value(1)).define('b', value('b'));
        const updated = m.replace('a', value(2));
        expect(container(updated).get('b')).toEqual('b');
      });

      it.skip(`can use all previously registered definitions`, async () => {
        const m = module('m')
          .define('a', value('a'))
          .define('aa', value('replaced'))
          .define('b', singleton(ArgsDebug), ['a'])
          .define('c', singleton(ArgsDebug), ['b']);

        // @ts-expect-error - one can replace definition only with the same type - string is not compatible with ArgsDebug Class
        const updated = m.replace('b', value('bReplaced'));

        expect(container(m).get('b').args).toEqual(['a']);
      });

      it.skip(`can use all previously registered definitions`, async () => {
        const m = module('m')
          .define('a', value('a'))
          .define('b', singleton(ArgsDebug), ['a'])
          .define('c', singleton(ArgsDebug), ['b']);

        expect(container(m).get('b').args).toEqual(['a']);

        const updated = m.replace('b', singleton(ArgsDebug), ['b']);

        expect(container(updated).get('b')).toEqual('bReplaced');
        expect(container(updated).get('c')).toEqual({
          args: ['bReplaced'],
        });
      });
    });
  });

  describe(`lazy loading`, () => {
    function setup() {
      const c = container(module('emptyRoot'));

      const parentChildValue = dependency('parentChild');
      const parentChild = module('parentChild').define('value', parentChildValue);

      const parentSiblingChildValue = dependency('parentSiblingChild');
      const parentSiblingChild = module('parentSiblingChild').define('value', parentSiblingChildValue);

      const parentValue = dependency('parent');
      const parent = module('parent').define('child', parentChild).define('value', parentValue);

      const parentSiblingValue = dependency('parentSibling');
      const parentSibling = module('parentSibling')
        .define('child', parentSiblingChild)
        .define('value', parentSiblingValue);

      return {
        c,
        parent,
        parentValue,
        parentSibling,
        parentSiblingValue,
        parentChild,
        parentChildValue,
        parentSiblingChild,
        parentSiblingChildValue,
      };
    }

    it(`calls onInit on parent definitions`, async () => {
      const { c, parent, parentValue } = setup();
      jest.spyOn(parentValue, 'onInit');
      c.get(parent, 'value');
      expect(parentValue.onInit).toHaveBeenCalled();
    });

    it(`calls onInit on child definition`, async () => {
      const { c, parentChild, parentChildValue } = setup();
      jest.spyOn(parentChildValue, 'onInit');
      c.get(parentChild, 'value');
      expect(parentChildValue.onInit).toHaveBeenCalled();
    });

    it(`does not call onInit on parent module while instantiating definitions from child`, async () => {
      const { c, parentValue, parentChild } = setup();
      jest.spyOn(parentValue, 'onInit');
      c.get(parentChild, 'value');

      expect(parentValue.onInit).not.toHaveBeenCalled();
    });

    it(`calls on init on child definitions while instantiating definitions from parent`, async () => {
      const { c, parent, parentValue, parentChildValue } = setup();
      jest.spyOn(parentValue, 'onInit');
      jest.spyOn(parentChildValue, 'onInit');

      c.get(parent, 'value');

      expect(parentValue.onInit).toHaveBeenCalled();
      expect(parentChildValue.onInit).toHaveBeenCalled();
    });

    it.skip(`does not reinitialize definitions after the module is lazily loaded for the firs time`, async () => {
      const { c, parent, parentChild, parentValue, parentChildValue } = setup();
      jest.spyOn(parentValue, 'onInit');
      jest.spyOn(parentChildValue, 'onInit');

      c.get(parent, 'value');
      c.get(parentChild, 'value');

      expect(parentValue.onInit).toHaveBeenCalledTimes(1);
      expect(parentChildValue.onInit).toHaveBeenCalledTimes(1);
    });

    it(`initializes child module definitions while initializing definitions from parent referencing child module`, async () => {
      const { c, parent, parentChild, parentValue, parentChildValue } = setup();
      jest.spyOn(parentValue, 'onInit');
      jest.spyOn(parentChildValue, 'onInit');

      c.get(parentChild, 'value');
      c.get(parent, 'value');

      expect(parentValue.onInit).toHaveBeenCalledTimes(1);
      expect(parentChildValue.onInit).toHaveBeenCalledTimes(2);
    });

    it.todo(`Eagerly initializes parent module while instantiating definition from child module?? `);
  });
});
