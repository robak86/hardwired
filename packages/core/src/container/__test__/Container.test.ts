import { dependency, DummyResolver } from '../../__test__/TestResolvers';
import { container } from '../Container';
import { value } from '../../resolvers/ValueResolver';
import { singleton } from '../../resolvers/ClassSingletonResolver';
import { ArgsDebug, TestClassArgs2 } from '../../__test__/ArgsDebug';
import { module } from '../../module/ModuleBuilder';
import { ContainerContext } from '../ContainerContext';

describe(`Container`, () => {
  describe(`.get`, () => {
    it(`returns correct value`, async () => {
      const child2 = module('child').define('c', dependency('cValue')).define('d', dependency('dValue'));
      const c = container();

      const cValue = c.get(child2, 'c');
      expect(cValue).toEqual('cValue');
    });

    it(`lazily appends new module if module cannot be found`, async () => {
      const notRegistered = module('notUsed') // breakme
        .define('a', dependency(1));

      const c = container();

      expect(c.get(notRegistered, 'a')).toEqual(1);
    });
  });

  describe(`.replace`, () => {
    describe(`using module.replace`, () => {
      it(`returns replaced value`, async () => {
        const m = module('m').define('a', value(1));
        const updated = m.replace('a', value(2));
        expect(container().get(updated, 'a')).toEqual(2);
      });

      it(`does not affect other definitions`, async () => {
        const m = module('m').define('a', value(1)).define('b', value('b'));
        const updated = m.replace('a', value(2));
        expect(container().get(updated, 'b')).toEqual('b');
      });

      it.skip(`can use all previously registered definitions`, async () => {
        const m = module('m')
          .define('a', value('a'))
          .define('aa', value('replaced'))
          .define('b', singleton(ArgsDebug), ['a'])
          .define('c', singleton(ArgsDebug), ['b']);

        // @ts-expect-error - one can replace definition only with the same type - string is not compatible with ArgsDebug Class
        const updated = m.replace('b', value('bReplaced'));

        expect(container().get(m, 'b').args).toEqual(['a']);
      });

      it.skip(`can use all previously registered definitions`, async () => {
        const m = module('m')
          .define('a', value('a'))
          .define('b', singleton(ArgsDebug), ['a'])
          .define('c', singleton(ArgsDebug), ['b']);

        expect(container().get(m, 'b').args).toEqual(['a']);

        const updated = m.replace('b', singleton(ArgsDebug), ['b']);

        expect(container().get(updated, 'b')).toEqual('bReplaced');
        expect(container().get(updated, 'c')).toEqual({
          args: ['bReplaced'],
        });
      });
    });
  });

  describe(`lazy loading`, () => {
    function setup() {
      const c = container();

      const parentChildValue = dependency('parentChild');
      const parentChild = module('parentChild').define('value', parentChildValue);

      const parentSiblingChildValue = dependency('parentSiblingChild');
      const parentSiblingChild = module('parentSiblingChild').define('value', parentSiblingChildValue);

      const parentValue = dependency('parent');
      const parent = module('parent').import('child', parentChild).define('value', parentValue);

      const parentSiblingValue = dependency('parentSibling');
      const parentSibling = module('parentSibling')
        .import('child', parentSiblingChild)
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

    it.skip(`calls onInit with dependencies resolvers id's`, async () => {
      const numberResolver = value(123);
      const stringResolver = value('some string');
      const singletonResolver = singleton(TestClassArgs2);

      (singletonResolver as any).onInit = () => null;
      jest.spyOn(singletonResolver, 'onInit');

      const m = module('parent')
        .define('someNumber', numberResolver)
        .define('someString', stringResolver)
        .define('cls', singletonResolver, ['someNumber', 'someString']);

      const containerContext = ContainerContext.empty();

      const c = container({ context: containerContext });
      c.get(m, 'someString');

      expect(singletonResolver.onInit).toHaveBeenCalledWith(containerContext);
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

    it(`does not call onInit on child definitions which are not used as dependencies`, async () => {
      const { c, parent, parentValue, parentChildValue } = setup();
      jest.spyOn(parentValue, 'onInit');
      jest.spyOn(parentChildValue, 'onInit');

      c.get(parent, 'value');

      expect(parentValue.onInit).toHaveBeenCalled();
      expect(parentChildValue.onInit).not.toHaveBeenCalled();
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
      expect(parentChildValue.onInit).toHaveBeenCalledTimes(1);
    });

    it.todo(`Eagerly initializes parent module while instantiating definition from child module?? `);
  });

  describe(`eager loading`, () => {
    it(`calls onInit on every definition`, async () => {
      const childDef1 = dependency('child1');
      const childDef2 = dependency('child2');
      const parentDef = dependency('parent1');

      const m = module('childModule') //breakme
        .define('a', childDef1)
        .define('b', childDef2);

      const p = module('parent') //breakme
        .import('child', m)
        .define('c', parentDef);

      jest.spyOn(childDef1, 'onInit');
      jest.spyOn(childDef2, 'onInit');
      jest.spyOn(parentDef, 'onInit');

      const c = container({ eager: [p] });

      expect(childDef1.onInit).toHaveBeenCalledTimes(1);
      expect(childDef2.onInit).toHaveBeenCalledTimes(1);
      expect(parentDef.onInit).toHaveBeenCalledTimes(1);
    });

    it(`does not call onInit on parent modules`, async () => {
      const childDef1 = dependency('child1');
      const childDef2 = dependency('child2');
      const parentDef = dependency('parent1');

      const m = module('childModule') //breakme
        .define('a', childDef1)
        .define('b', childDef2);

      const p = module('parent') //breakme
        .import('child', m)
        .define('c', parentDef);

      jest.spyOn(childDef1, 'onInit');
      jest.spyOn(childDef2, 'onInit');
      jest.spyOn(parentDef, 'onInit');

      const c = container({ eager: [m] });

      expect(childDef1.onInit).toHaveBeenCalledTimes(1);
      expect(childDef2.onInit).toHaveBeenCalledTimes(1);
      expect(parentDef.onInit).toHaveBeenCalledTimes(0);
    });

    it(`does not call onInit multiple times`, async () => {
      const childDef1 = dependency('child1');
      const childDef2 = dependency('child2');
      const parentDef = dependency('parent1');

      const m = module('childModule') //breakme
        .define('a', childDef1)
        .define('b', childDef2);

      const p = module('parent') //breakme
        .import('child', m)
        .define('c', parentDef);

      jest.spyOn(childDef1, 'onInit');
      jest.spyOn(childDef2, 'onInit');
      jest.spyOn(parentDef, 'onInit');

      const c = container({ eager: [m] });
      c.get(p, 'c');

      expect(childDef1.onInit).toHaveBeenCalledTimes(1);
      expect(childDef2.onInit).toHaveBeenCalledTimes(1);
      expect(parentDef.onInit).toHaveBeenCalledTimes(1);
    });
  });

  describe(`getByType`, () => {
    it(`returns instances by resolver types`, async () => {
      const m = module('test')
        .define('value', value(123))
        .define('dependency1', dependency(456))
        .define('dependency2', dependency(789));
      const c = container({ eager: [m] });

      const instances = c.getContext().__getByType_experimental(DummyResolver);
      expect(instances).toEqual([456, 789]);
    });

    it(`returns instances by resolver types from imported modules`, async () => {
      const m = module('test')
        .import('imported', () => child)
        .define('value', value(123))
        .define('dependency1', dependency(456));

      const child = module('child').define('dependency2', dependency(789));

      const c = container({ eager: [m] });

      const instances = c.getContext().__getByType_experimental(DummyResolver);
      expect(instances).toEqual([789, 456]); //TODO: investigate in what order should be returned instances
    });
  });
});
