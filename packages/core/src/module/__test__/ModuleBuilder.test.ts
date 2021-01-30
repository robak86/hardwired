import { expectType, TypeEqual } from 'ts-expect';
import { module, ModuleBuilder } from '../ModuleBuilder';
import { ClassType } from '../../utils/ClassType';
import { value, ValueResolver } from '../../resolvers/ValueResolver';
import { singleton } from '../../resolvers/ClassSingletonResolver';
import { container } from '../../container/Container';
import { Module } from '../../resolvers/abstract/Module';
import { Instance, Scope } from '../../resolvers/abstract/Instance';
import { TestClassArgs2 } from '../../__test__/ArgsDebug';
import { literal } from '../../resolvers/LiteralResolver';

describe(`ModuleBuilder`, () => {
  const dummy = <TValue>(value: TValue): Instance<TValue, []> => {
    return new ValueResolver(value);
  };

  const dummyClassResolver = <TDeps extends any[], TValue>(cls: ClassType<TValue, TDeps>): Instance<TValue, TDeps> => {
    return singleton(cls);
  };

  describe(`define`, () => {
    it(`creates correct type`, async () => {
      const m = ModuleBuilder.empty('someModule')
        .define('key1', dummy(123))
        .define('key2', dummy(true))
        .define('key3', dummy('string'))
        .define(
          'key4',
          dummy(() => 'someString'),
        );

      type ExpectedType = {
        key1: number;
        key2: boolean;
        key3: string;
        key4: () => 'someString';
      };

      type Actual = Module.Materialized<typeof m>;

      expectType<TypeEqual<Actual, ExpectedType>>(true);
    });

    it(`providing deps`, async () => {
      const m2 = ModuleBuilder.empty('someModule').define('string', dummy('string')).define('number', dummy(123));

      m2.define('cls', dummyClassResolver(TestClassArgs2), ['number', 'string']);

      // @ts-expect-error - dependencies were passed in the wrong order
      m2.define('cls', dummyClassResolver(TestClassArgs2), ['string', 'number']);

      // @ts-expect-error - on of the dependencies is missing
      m2.define('cls', dummyClassResolver(TestClassArgs2), ['number']);

      // @ts-expect-error - dependencies array is empty
      m2.define('cls', dummyClassResolver(TestClassArgs2), []);

      // @ts-expect-error - dependencies array is not provided
      m2.define('cls', dummyClassResolver(TestClassArgs2));
    });

    it(`providing deps from imported modules`, async () => {
      const child = ModuleBuilder.empty('child')
        .define('someNumber', value(123))
        .define('someString', value('content'));

      const m2 = ModuleBuilder.empty('someModule').import('imported', () => child);

      m2.define('cls', dummyClassResolver(TestClassArgs2), ['imported.someNumber', 'imported.someString']);

      // @ts-expect-error - dependencies were passed in the wrong order
      m2.define('cls', dummyClassResolver(TestClassArgs2), ['imported.someString', 'imported.someNumber']);

      // @ts-expect-error - on of the dependencies is missing
      m2.define('cls', dummyClassResolver(TestClassArgs2), ['imported.someNumber']);

      // @ts-expect-error - dependencies array is empty
      m2.define('cls', dummyClassResolver(TestClassArgs2), []);

      // @ts-expect-error - dependencies array is not provided
      m2.define('cls', dummyClassResolver(TestClassArgs2));
    });

    it(`creates correct types for imports`, async () => {
      const m1 = ModuleBuilder.empty('someModule').define('key1', dummy(123));
      const m2 = ModuleBuilder.empty('someModule').import('imported', m1).define('key1', dummy(123));

      type ExpectedType = {
        key1: number;
      };

      type Actual = Module.Materialized<typeof m2>;

      expectType<TypeEqual<Actual['imported'], ExpectedType>>(true);
    });

    it(`creates correct types for replace`, async () => {
      const m1 = ModuleBuilder.empty('someModule').define('key1', dummy(123));

      const m2 = ModuleBuilder.empty('someModule')
        .import('imported', m1)
        .define('key2', dummy('string'))
        .define('key1', dummy(123));

      const replaced = m2.replace('key1', dummy(123));

      type ExpectedType = {
        imported: {
          key1: number;
        };
        key2: string;
        key1: number;
      };

      expectType<TypeEqual<Module.Materialized<typeof replaced>, ExpectedType>>(true);

      // @ts-expect-error - replacing is only allowed for the same types (cannot replace int with string)
      m2.replace('key1', dummy('sdf'));
    });
  });

  describe(`override`, () => {
    it(`replaces child module`, async () => {
      const child1 = ModuleBuilder.empty('child1').define('key1', dummy(123)).define('key2', dummy('someString'));

      const root = ModuleBuilder.empty('root')
        .import('imported', child1)
        .define('cls', singleton(TestClassArgs2), ['imported.key1', 'imported.key2']);

      const c = container({
        overrides: [child1.replace('key2', dummy('replacedString'))],
      });

      const classInstance = c.get(root, 'cls');
      expect(classInstance.someString).toEqual('replacedString');
    });

    it(`replaces all imports of given module`, async () => {
      const root = ModuleBuilder.empty('root')
        .import('import1', () => child1)
        .import('import2', () => child1)
        .define('cls', singleton(TestClassArgs2), ['import1.key1', 'import2.key2']);

      const child1 = ModuleBuilder.empty('child1').define('key1', dummy(123)).define('key2', dummy('someString'));

      const c = container({
        overrides: [
          child1 //breakme
            .replace('key1', dummy(456))
            .replace('key2', dummy('replacedString')),
        ],
      });

      const classInstance = c.get(root, 'cls');
      expect(classInstance.someNumber).toEqual(456);
      expect(classInstance.someString).toEqual('replacedString');
    });
  });

  describe(`isEqual`, () => {
    it(`returns false for two newly created empty modules`, async () => {
      const m1 = module('');
      const m2 = module('');
      expect(m1.isEqual(m2)).toEqual(false);
    });

    it(`returns false for module extended with a new definition`, async () => {
      const m1 = module('').define('a', value('string'));
      const m2 = m1.define('b', value('someOtherString'));
      expect(m1.isEqual(m2)).toEqual(false);
    });

    it(`returns true for module with replaced value`, async () => {
      const m1 = module('').define('a', value('string'));
      const m2 = m1.replace('a', value('someOtherString'));
      expect(m1.isEqual(m2)).toEqual(true);
    });
  });

  describe(`replace`, () => {
    describe(`types`, () => {
      it(`does not allow to replace not existing definition`, async () => {
        const emptyModule = module('empty');

        try {
          // @ts-expect-error - invalid key
          emptyModule.replace('should raise compilation error', () => value(1));
        } catch (err) {
          // catch runtime error related to missing key
        }
      });

      it(`requires that new definition extends the original`, async () => {
        const emptyModule = module('empty').define('someString', value('string'));

        // @ts-expect-error - value(1) is not compatible with string
        emptyModule.replace('someString', () => value(1));
      });
    });
  });

  describe(`decorate`, () => {
    it(`decorates original value`, async () => {
      const m = module('example')
        .define('someValue', value(1))
        .decorate('someValue', val => val + 1);

      const c = container();
      expect(c.get(m, 'someValue')).toEqual(2);
    });

    it(`does not affect original module`, async () => {
      const m = module('example').define('someValue', value(1));
      const decorated = m.decorate('someValue', val => val + 1);

      expect(container().get(m, 'someValue')).toEqual(1);
      expect(container().get(decorated, 'someValue')).toEqual(2);
    });

    it(`allows for multiple decorations`, async () => {
      const m = module('example')
        .define('someValue', value(1))
        .decorate('someValue', val => val + 1)
        .decorate('someValue', val => val * 3);

      const c = container();
      expect(c.get(m, 'someValue')).toEqual(6);
    });

    it(`works allows to using other dependencies`, async () => {
      const m = module('example')
        .define('a', value(1))
        .define('b', value(2))
        .define('someValue', value(10))
        .decorate('someValue', (val, { a, b }) => val + a + b);

      const c = container();
      expect(c.get(m, 'someValue')).toEqual(13);
    });

    it(`works allows to using other dependencies`, async () => {
      const m = module('example')
        .define('a', value(1))
        .define('b', value(2))
        .define(
          'someValue',
          literal(({ a, b }) => a + b),
        )
        .decorate('someValue', (val, { b }) => val * b);

      const c = container();
      expect(c.get(m, 'someValue')).toEqual(6);
    });

    describe(`scopes`, () => {
      it(`preserves singleton scope of the original resolver`, async () => {
        const m = module('example')
          .define(
            'a',
            literal(() => Math.random(), Scope.singleton),
          )

          .decorate('a', a => a);

        const c = container();
        expect(c.get(m, 'a')).toEqual(c.get(m, 'a'));
      });

      it(`preserves transient scope of the original resolver`, async () => {
        const m = module('example')
          .define(
            'a',
            literal(() => Math.random(), Scope.transient),
          )

          .decorate('a', a => a);

        const c = container();
        expect(c.get(m, 'a')).not.toEqual(c.get(m, 'a'));
      });

      it(`preserves request scope of the original resolver`, async () => {
        const m = module('example')
          .define(
            'source',
            literal(() => Math.random(), Scope.request),
          )
          .define(
            'a',
            literal(({ source }) => source, Scope.request),
          )

          .decorate('a', a => a);

        const c = container();
        const req1 = c.asObject(m);
        const req2 = c.asObject(m);

        expect(req1.source).toEqual(req1.a);
        expect(req2.source).toEqual(req2.a);
        expect(req1.source).not.toEqual(req2.source);
        expect(req1.a).not.toEqual(req2.a);
      });
    });

    describe(`overrides`, () => {
      it(`acts like replace in terms of module identity`, async () => {
        const m = module('example').define('a', value(1));

        const c = container({ overrides: [m.decorate('a', a => a + 1)] });

        expect(c.get(m, 'a')).toEqual(2);
      });
    });
  });
});
