import { expectType, TypeEqual } from "ts-expect";
import {
  AbstractInstanceResolver,
  MaterializeModule,
  ModuleBuilder,
  ModuleEntryResolver,
  moduleImport
} from "../ModuleBuilder";
import { ClassType } from "../../utils/ClassType";

describe(`Module`, () => {
  const dummy = <TValue>(value: TValue): AbstractInstanceResolver<TValue, []> => {
    throw new Error('implement me');
  };

  const dummyClassResolver = <TDeps extends any[], TValue>(
    cls: ClassType<TDeps, TValue>,
  ): AbstractInstanceResolver<TValue, TDeps> => {
    throw new Error('implement me');
  };

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

    expectType<TypeEqual<MaterializeModule<typeof m>, ExpectedType>>(true);
  });

  it(`providing deps`, async () => {
    class TestClass {
      constructor(private a: number, private b: string) {}
    }

    const m2 = ModuleBuilder.empty('someModule').define('string', dummy('string')).define('number', dummy(123));

    m2.define('cls', dummyClassResolver(TestClass), ['number', 'string']);

    // @ts-expect-error - dependencies were passed in the wrong order
    m2.define('cls', dummyClassResolver(TestClass), ['string', 'number']);

    // @ts-expect-error - on of the dependencies is missing
    m2.define('cls', dummyClassResolver(TestClass), ['number']);

    // @ts-expect-error - dependencies array is empty
    m2.define('cls', dummyClassResolver(TestClass), []);

    // @ts-expect-error - dependencies array is not provided
    m2.define('cls', dummyClassResolver(TestClass));
  });

  it(`creates correct types for imports`, async () => {
    const m1 = ModuleBuilder.empty('someModule').define('key1', dummy(123));
    const m2 = ModuleBuilder.empty('someModule').define('imported', moduleImport(m1)).define('key1', dummy(123));

    type ExpectedType = {
      key1: number;
    };

    expectType<TypeEqual<MaterializeModule<typeof m2>['imported'], ExpectedType>>(true);
  });

  it(`creates correct types for replace`, async () => {
    const m1 = ModuleBuilder.empty('someModule').define('key1', dummy(123));

    const m2 = ModuleBuilder.empty('someModule')
      .define('imported', moduleImport(m1))
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

    expectType<TypeEqual<MaterializeModule<typeof replaced>, ExpectedType>>(true);

    // @ts-expect-error - replacing is only allowed for the same types (cannot replace int with string)
    m2.replace('key1', dummy('sdf'));
  });
});
