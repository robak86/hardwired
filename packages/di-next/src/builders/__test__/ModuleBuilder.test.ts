import { ModuleBuilder } from "../ModuleBuilder";
import { AbstractDependencyResolver } from "../../resolvers/AbstractDependencyResolver";
import { ContainerCache } from "../../container/container-cache";
import { expectType, TypeEqual } from "ts-expect";
import { DependencyFactory } from "../../draft";
import { importModule } from "../../resolvers/ModuleResolver";
import { DependencyResolver } from "../../resolvers/DependencyResolver";

describe(`ModuleBuilder`, () => {
  class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
    constructor(value: TValue) {
      super();
    }

    build(registry: ContainerCache): TValue {
      throw new Error('Implement me');
    }
  }
  const dummy = <TValue>(value: TValue): DummyResolver<TValue> => {
    return new DummyResolver<TValue>(value);
  };

  it(`creates correct type`, async () => {
    const m = ModuleBuilder.empty('someModule')
      .define('key1', ctx => dummy(123))
      .define('key2', ctx => dummy(true))
      .define('key3', ctx => dummy('string'))
      .define('key4', ctx => dummy(() => 'someString'));

    type ExpectedType = {
      key1: (c: ContainerCache) => number;
      key2: (c: ContainerCache) => boolean;
      key3: (c: ContainerCache) => string;
      key4: (c: ContainerCache) => () => 'someString';
    };

    expectType<TypeEqual<ModuleBuilder.RegistryRecord<typeof m>, ExpectedType>>(true);
  });

  it(`creates correct types for deps`, async () => {
    type ExpectedType = {
      key1: (c: ContainerCache) => number;
      key2: (c: ContainerCache) => boolean;
      key3: (c: ContainerCache) => string;
      key4: (c: ContainerCache) => () => 'someString';
    };

    const m = ModuleBuilder.empty('someModule') // breakme
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
    const m1 = ModuleBuilder.empty('someModule').define('key1', ctx => dummy(123));

    const m2 = ModuleBuilder.empty('someModule')
      .define('imported', ctx => importModule(m1))
      .define('key1', _ => {
        expectType<TypeEqual<typeof _, { imported: ModuleBuilder.RegistryRecord<typeof m1> }>>(true);

        return dummy(123);
      });
  });

  it(`creates correct types for replace`, async () => {
    const m1 = ModuleBuilder.empty('someModule').define('key1', ctx => dummy(123));

    const m2 = ModuleBuilder.empty('someModule')
      .define('imported', ctx => importModule(m1))
      .define('key2', ctx => dummy('string'))
      .define('key1', _ => {
        expectType<
          TypeEqual<typeof _, { imported: ModuleBuilder.RegistryRecord<typeof m1>; key2: DependencyFactory<string> }>
        >(true);

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
