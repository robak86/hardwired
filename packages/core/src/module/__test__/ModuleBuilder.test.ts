import { Module } from '../Module';
import { AbstractDependencyResolver } from '../../resolvers/AbstractDependencyResolver';
import { ContainerContext } from '../../container/ContainerContext';
import { expectType, TypeEqual } from 'ts-expect';
import { moduleImport } from '../../resolvers/ModuleResolver';
import { DependencyResolver } from '../../resolvers/DependencyResolver';
import { DependencyFactory } from '../RegistryRecord';

describe(`Module`, () => {
  class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
    constructor(value: TValue) {
      super();
    }

    build(registry: ContainerContext): TValue {
      throw new Error('Implement me');
    }
  }
  const dummy = <TValue>(value: TValue): DummyResolver<TValue> => {
    return new DummyResolver<TValue>(value);
  };

  it(`creates correct type`, async () => {
    const m = Module.empty('someModule')
      .define('key1', ctx => dummy(123))
      .define('key2', ctx => dummy(true))
      .define('key3', ctx => dummy('string'))
      .define('key4', ctx => dummy(() => 'someString'));

    type ExpectedType = {
      key1: (c: ContainerContext) => number;
      key2: (c: ContainerContext) => boolean;
      key3: (c: ContainerContext) => string;
      key4: (c: ContainerContext) => () => 'someString';
    };

    expectType<TypeEqual<Module.Registry<typeof m>, ExpectedType>>(true);
  });

  it(`creates correct types for deps`, async () => {
    type ExpectedType = {
      key1: (c: ContainerContext) => number;
      key2: (c: ContainerContext) => boolean;
      key3: (c: ContainerContext) => string;
      key4: (c: ContainerContext) => () => 'someString';
    };

    const m = Module.empty('someModule') // breakme
      .define('key1', _ => {
        expectType<TypeEqual<typeof _, {}>>(true);

        return dummy(123);
      })
      .define('key2', _ => {
        expectType<TypeEqual<typeof _, Pick<ExpectedType, 'key1'>>>(true);

        return dummy(true);
      })

      .define('key3', _ => {
        expectType<TypeEqual<typeof _, Pick<ExpectedType, 'key1' | 'key2'>>>(true);

        return dummy('string');
      })

      .define('key4', _ => {
        expectType<TypeEqual<typeof _, Pick<ExpectedType, 'key1' | 'key2' | 'key3'>>>(true);

        return dummy(() => 'someString');
      });
  });

  it(`creates correct types for imports`, async () => {
    const m1 = Module.empty('someModule').define('key1', ctx => dummy(123));

    const m2 = Module.empty('someModule')
      .define('imported', ctx => moduleImport(m1))
      .define('key1', _ => {
        expectType<TypeEqual<typeof _, { imported: Module.Registry<typeof m1> }>>(true);

        return dummy(123);
      });
  });

  it(`creates correct types for replace`, async () => {
    const m1 = Module.empty('someModule').define('key1', ctx => dummy(123));

    const m2 = Module.empty('someModule')
      .define('imported', ctx => moduleImport(m1))
      .define('key2', ctx => dummy('string'))
      .define('key1', _ => {
        expectType<TypeEqual<typeof _, { imported: Module.Registry<typeof m1>; key2: DependencyFactory<string> }>>(
          true,
        );

        return dummy(123);
      });

    type Expected = (key: 'key1' | 'key2', factory: (ctx: any) => DependencyResolver<number>) => typeof m2;

    m2.replace('key1', ctx => {
      // ctx.key2
      return dummy('string');
    });

    expectType<TypeEqual<typeof m2.replace, Expected>>(true);
  });
});