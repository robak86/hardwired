import { container } from '../Container';

import { ArgsDebug } from '../../__test__/ArgsDebug';
import { module } from '../../module/ModuleBuilder';
import { singleton } from '../../strategies/SingletonStrategy';

describe(`Container`, () => {
  describe(`.get`, () => {
    it(`returns correct value`, async () => {
      const child2 = module()
        .define('c', () => 'cValue')
        .define('d', () => 'dValue')
        .build();
      const c = container();

      const cValue = c.get(child2, 'c');
      expect(cValue).toEqual('cValue');
    });

    it(`lazily appends new module if module cannot be found`, async () => {
      const notRegistered = module() // breakme
        .define('a', () => 1)
        .build();

      const c = container();

      expect(c.get(notRegistered, 'a')).toEqual(1);
    });
  });

  describe(`.replace`, () => {
    describe(`using module.replace`, () => {
      it(`returns replaced value`, async () => {
        const m = module()
          .define('a', () => 1)
          .build();
        const updated = m.replace('a', () => 2);
        expect(container().get(updated, 'a')).toEqual(2);
      });

      it(`allows returning strategy instead of instance`, async () => {
        const m = module()
          .define('a', () => 1)
          .build();
        const updated = m.replace('a', () => singleton(() => 3));
        expect(container().get(updated, 'a')).toEqual(3);
      });

      it(`calls provided function with materialized module`, async () => {
        const m = module()
          .define('b', () => 2)
          .define('a', () => 1)
          .build();

        const factoryFunctionSpy = jest.fn().mockImplementation(ctx => {
          return singleton(() => 3);
        });

        const updated = m.replace('a', factoryFunctionSpy);

        const testContainer = container();
        testContainer.get(updated, 'a');

        expect(factoryFunctionSpy.mock.calls[0][0]).toEqual(testContainer.asObject(updated));
      });

      it(`forbids to reference replaced value from the context`, async () => {
        const m = module()
          .define('b', () => 2)
          .define('a', () => 1)
          .build();

        const updated = m.replace('a', ctx => {
          // @ts-expect-error - a shouldn't be available in the ctx to avoid Maximum call stack size exceeded
          ctx.a;
          return singleton(() => 1);
        });
      });

      it(`does not affect other definitions`, async () => {
        const m = module()
          .define('a', () => 1)
          .define('b', () => 'b')
          .build();
        const updated = m.replace('a', () => 2);
        expect(container().get(updated, 'b')).toEqual('b');
      });

      it.skip(`can use all previously registered definitions`, async () => {
        const m = module()
          .define('a', () => 'a')
          .define('aa', () => 'replaced')
          .define('b', ({ a }) => new ArgsDebug(a), singleton)
          .define('c', ({ b }) => new ArgsDebug(b), singleton)
          .build();

        // @ts-expect-error - one can replace definition only with the same type - string is not compatible with ArgsDebug Class
        const updated = m.replaceAdvanced('b', value('bReplaced'));

        expect(container().get(m, 'b').args).toEqual(['a']);
      });
    });
  });

  describe(`lazy loading`, () => {
    function setup() {
      const c = container();

      const parentChildValue = () => 'parentChild';
      const parentChild = module().define('value', parentChildValue).build();

      const parentSiblingChildValue = () => 'parentSiblingChild';
      const parentSiblingChild = module().define('value', parentSiblingChildValue).build();

      const parentValue = () => 'parent';
      const parent = module().import('child', parentChild).define('value', parentValue).build();

      const parentSiblingValue = () => 'parentSibling';
      const parentSibling = module().import('child', parentSiblingChild).define('value', parentSiblingValue).build();

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

    it.skip(`calls onInit on parent definitions`, async () => {
      // const { c, parent, parentValue } = setup();
      // jest.spyOn(parentValue, 'onInit');
      // c.get(parent, 'value');
      // expect(parentValue.onInit).toHaveBeenCalled();
    });

    it.skip(`calls onInit with dependencies resolvers id's`, async () => {
      const numberResolver = () => 123;
      const stringResolver = () => 'some string';
      // const singletonResolver = singleton(TestClassArgs2);

      // (singletonResolver as any).onInit = () => null;
      // jest.spyOn(singletonResolver, 'onInit');
      //
      // const m = module()
      //   .define('someNumber', numberResolver)
      //   .define('someString', stringResolver)
      //   .define('cls', c => new TestClassArgs2(c.someNumber, c.someString), singleton)
      //   .freeze();
      //
      // const containerContext = ContainerContext.empty();
      //
      // const c = container({ context: containerContext });
      // c.get(m, 'someString');
      //
      // expect(singletonResolver.onInit).toHaveBeenCalledWith(containerContext);
    });

    it.skip(`calls onInit on child definition`, async () => {
      // const { c, parentChild, parentChildValue } = setup();
      // jest.spyOn(parentChildValue, 'onInit');
      // c.get(parentChild, 'value');
      // expect(parentChildValue.onInit).toHaveBeenCalled();
    });

    it.skip(`does not call onInit on parent module while instantiating definitions from child`, async () => {
      // const { c, parentValue, parentChild } = setup();
      // jest.spyOn(parentValue, 'onInit');
      // c.get(parentChild, 'value');
      //
      // expect(parentValue.onInit).not.toHaveBeenCalled();
    });

    it.skip(`does not call onInit on child definitions which are not used as dependencies`, async () => {
      // const { c, parent, parentValue, parentChildValue } = setup();
      // jest.spyOn(parentValue, 'onInit');
      // jest.spyOn(parentChildValue, 'onInit');
      //
      // c.get(parent, 'value');
      //
      // expect(parentValue.onInit).toHaveBeenCalled();
      // expect(parentChildValue.onInit).not.toHaveBeenCalled();
    });

    it.skip(`does not reinitialize definitions after the module is lazily loaded for the firs time`, async () => {
      // const { c, parent, parentChild, parentValue, parentChildValue } = setup();
      // jest.spyOn(parentValue, 'onInit');
      // jest.spyOn(parentChildValue, 'onInit');
      //
      // c.get(parent, 'value');
      // c.get(parentChild, 'value');
      //
      // expect(parentValue.onInit).toHaveBeenCalledTimes(1);
      // expect(parentChildValue.onInit).toHaveBeenCalledTimes(1);
    });

    it.skip(`initializes child module definitions while initializing definitions from parent referencing child module`, async () => {
      // const { c, parent, parentChild, parentValue, parentChildValue } = setup();
      // jest.spyOn(parentValue, 'onInit');
      // jest.spyOn(parentChildValue, 'onInit');
      //
      // c.get(parentChild, 'value');
      // c.get(parent, 'value');
      //
      // expect(parentValue.onInit).toHaveBeenCalledTimes(1);
      // expect(parentChildValue.onInit).toHaveBeenCalledTimes(1);
    });

    it.todo(`Eagerly initializes parent module while instantiating definition from child module?? `);
  });

  describe(`eager loading`, () => {
    it(`calls onInit on every definition`, async () => {
      // const childDef1 = () => ('child1');
      // const childDef2 = () => ('child2');
      // const parentDef = () => ('parent1');
      //
      // const m = module() //breakme
      //   .defineAdvanced('a', childDef1)
      //   .defineAdvanced('b', childDef2)
      //   .freeze();
      //
      // const p = module() //breakme
      //   .import('child', m)
      //   .defineAdvanced('c', parentDef)
      //   .freeze();
      //
      // jest.spyOn(childDef1, 'onInit');
      // jest.spyOn(childDef2, 'onInit');
      // jest.spyOn(parentDef, 'onInit');
      //
      // const c = container({ eager: [p] });
      //
      // expect(childDef1.onInit).toHaveBeenCalledTimes(1);
      // expect(childDef2.onInit).toHaveBeenCalledTimes(1);
      // expect(parentDef.onInit).toHaveBeenCalledTimes(1);
    });

    it(`does not call onInit on parent modules`, async () => {
      // const childDef1 = dependency('child1');
      // const childDef2 = dependency('child2');
      // const parentDef = dependency('parent1');
      //
      // const m = module() //breakme
      //   .defineAdvanced('a', childDef1)
      //   .defineAdvanced('b', childDef2)
      //   .freeze();
      //
      // const p = module() //breakme
      //   .import('child', m)
      //   .defineAdvanced('c', parentDef)
      //   .freeze();
      //
      // jest.spyOn(childDef1, 'onInit');
      // jest.spyOn(childDef2, 'onInit');
      // jest.spyOn(parentDef, 'onInit');
      //
      // const c = container({ eager: [m] });
      //
      // expect(childDef1.onInit).toHaveBeenCalledTimes(1);
      // expect(childDef2.onInit).toHaveBeenCalledTimes(1);
      // expect(parentDef.onInit).toHaveBeenCalledTimes(0);
    });

    it(`does not call onInit multiple times`, async () => {
      // const childDef1 = dependency('child1');
      // const childDef2 = dependency('child2');
      // const parentDef = dependency('parent1');
      //
      // const m = module() //breakme
      //   .defineAdvanced('a', childDef1)
      //   .defineAdvanced('b', childDef2)
      //   .freeze();
      //
      // const p = module() //breakme
      //   .import('child', m)
      //   .defineAdvanced('c', parentDef)
      //   .freeze();
      //
      // jest.spyOn(childDef1, 'onInit');
      // jest.spyOn(childDef2, 'onInit');
      // jest.spyOn(parentDef, 'onInit');
      //
      // const c = container({ eager: [m] });
      // c.get(p, 'c');
      //
      // expect(childDef1.onInit).toHaveBeenCalledTimes(1);
      // expect(childDef2.onInit).toHaveBeenCalledTimes(1);
      // expect(parentDef.onInit).toHaveBeenCalledTimes(1);
    });
  });

  describe(`getByType`, () => {
    it(`returns instances by resolver types`, async () => {
      // const m = module()
      //   .defineAdvanced('value', value(123))
      //   .defineAdvanced('dependency1', dependency(456))
      //   .defineAdvanced('dependency2', dependency(789))
      //   .freeze();
      //
      // const c = container({ eager: [m] });
      //
      // const instances = c.getContext().__getByType_experimental(DummyResolver);
      // expect(instances).toEqual([456, 789]);
    });

    it(`returns instances by resolver types from imported modules`, async () => {
      // const m = module()
      //   .import('imported', () => child)
      //   .defineAdvanced('value', value(123))
      //   .defineAdvanced('dependency1', dependency(456))
      //   .freeze();
      //
      // const child = module().defineAdvanced('dependency2', dependency(789)).freeze();
      //
      // const c = container({ eager: [m] });
      //
      // const instances = c.getContext().__getByType_experimental(DummyResolver);
      // expect(instances).toEqual([789, 456]); //TODO: investigate in what order should be returned instances
    });
  });
});
