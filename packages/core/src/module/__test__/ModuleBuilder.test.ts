import { expectType, TypeEqual } from 'ts-expect';
import { ModuleBuilder } from '../ModuleBuilder';
import { ClassType } from '../../utils/ClassType';
import { value, ValueResolver } from '../../resolvers/ValueResolver';
import { singleton } from '../../resolvers/ClassSingletonResolver';
import { container } from '../../container/Container';
import { Module } from '../../resolvers/abstract/Module';
import { Instance } from '../../resolvers/abstract/Instance';
import { TestClassArgs2 } from '../../testing/ArgsDebug';

describe(`Module`, () => {
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

      const m2 = ModuleBuilder.empty('someModule').define('imported', () => child);

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

    describe(`providing structured deps`, () => {
      it(`is typesafe`, async () => {
        class TestClass {
          constructor(private args: { a: string; b: number }) {}
        }

        const m2 = ModuleBuilder.empty('someModule') // breakme
          .define('string', dummy('string'))
          .define('number', dummy(123));

        const definition = dummyClassResolver(TestClass);

        m2.define('cls', definition, { a: 'string', b: 'number' });

        // @ts-expect-error - wrong dependency name used
        m2.define('cls', definition, { a: 'wrong_name', b: 'number' });

        // @ts-expect-error - wrong dependency key
        m2.define('cls', definition, { aa: 'string', b: 'number' });

        // @ts-expect-error - wrong dependencies types passed
        m2.define('cls', definition, { a: 'number', b: 'number' });

        // @ts-expect-error - dependencies array is empty
        m2.define('cls', definition, { a: 'string' });

        // @ts-expect-error - dependencies array is empty
        m2.define('cls', definition, {});

        // @ts-expect-error - dependencies array is not provided
        m2.define('cls', definition);
      });
    });

    it(`creates correct types for imports`, async () => {
      const m1 = ModuleBuilder.empty('someModule').define('key1', dummy(123));
      const m2 = ModuleBuilder.empty('someModule').define('imported', m1).define('key1', dummy(123));

      type ExpectedType = {
        key1: number;
      };

      type Actual = Module.Materialized<typeof m2>;

      expectType<TypeEqual<Actual['imported'], ExpectedType>>(true);
    });

    it(`creates correct types for replace`, async () => {
      const m1 = ModuleBuilder.empty('someModule').define('key1', dummy(123));

      const m2 = ModuleBuilder.empty('someModule')
        .define('imported', m1)
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

  describe(`inject`, () => {
    it(`returns unchanged module type`, async () => {
      const m1 = ModuleBuilder.empty('someModule').define('key1', dummy(123));
      const m2 = ModuleBuilder.empty('someModule').define('imported', m1).define('key1', dummy(123));

      const withInjection = m2.inject(m1);
    });

    it(`does not allow to inject unrelated module`, async () => {
      const m1 = ModuleBuilder.empty('someModule').define('key1', dummy(123));
      const m2 = ModuleBuilder.empty('someModule').define('imported', m1).define('key1', dummy(123));
      const unrelatedModule = ModuleBuilder.empty('someModule').define('differentKey', dummy(123));

      // @ts-expect-error - unrelated module does not extend m1 (differentKey not compatible with key)
      const withInjection = m2.inject(unrelatedModule);
    });

    it(`replaces child module`, async () => {
      const child1 = ModuleBuilder.empty('child1').define('key1', dummy(123)).define('key2', dummy('someString'));

      const root = ModuleBuilder.empty('root')
        .define('imported', child1)
        .define('cls', singleton(TestClassArgs2), ['imported.key1', 'imported.key2']);

      const rootWithInjection = root.inject(child1.replace('key2', dummy('replacedString')));
      const c = container();

      const classInstance = c.get(rootWithInjection, 'cls');
      expect(classInstance.someString).toEqual('replacedString');
    });

    it(`replaces all imports of given module`, async () => {
      const root = ModuleBuilder.empty('root')
        .define('import1', () => child1)
        .define('import2', () => child1)
        .define('cls', singleton(TestClassArgs2), ['import1.key1', 'import2.key2']);

      const child1 = ModuleBuilder.empty('child1').define('key1', dummy(123)).define('key2', dummy('someString'));

      const rootWithInjection = root.inject(
        child1 //breakme
          .replace('key1', dummy(456))
          .replace('key2', dummy('replacedString')),
      );

      const c = container();

      const classInstance = c.get(rootWithInjection, 'cls');
      expect(classInstance.someNumber).toEqual(456);
      expect(classInstance.someString).toEqual('replacedString');
    });
  });
});
