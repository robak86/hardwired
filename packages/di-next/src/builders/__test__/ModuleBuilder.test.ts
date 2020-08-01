import { ModuleBuilder, ModuleBuilderMaterialized } from "../ModuleBuilder";
import { AbstractDependencyResolver } from "../../resolvers/AbstractDependencyResolver";
import { ModuleRegistry } from "../../module/ModuleRegistry";
import { ContainerCache } from "../../container/container-cache";
import { expectType, TypeEqual } from "ts-expect";

describe(`ModuleBuilder`, () => {
  class DummyResolver<TKey extends string, TValue> extends AbstractDependencyResolver<TKey, TValue> {
    constructor(key: TKey, value: TValue) {
      super(key);
    }

    build(registry: ModuleRegistry<any>, cache: ContainerCache, ctx): TValue {
      throw new Error('Implement me');
    }
  }

  const dummy = <TKey extends string, TValue>(key: TKey, value: TValue): DummyResolver<TKey, TValue> => {
    return dummy<TKey, TValue>(key, value);
  };

  it(`creates correct type`, async () => {
    const m = ModuleBuilder.empty('someModule').append(
      _ => dummy('key1', 123),
      _ => dummy('key2', true),
      _ => dummy('key3', 'string'),
      _ => dummy('key4', () => 'someString'),
    );

    type ExpectedType = {
      key1: (c: ContainerCache) => number;
      key2: (c: ContainerCache) => boolean;
      key3: (c: ContainerCache) => string;
      key4: (c: ContainerCache) => () => 'someString';
    };

    expectType<TypeEqual<ModuleBuilderMaterialized<typeof m>, ExpectedType>>(true);
  });

  it(`creates correct types for deps`, async () => {
    type ExpectedType = {
      key1: (c: ContainerCache) => number;
      key2: (c: ContainerCache) => boolean;
      key3: (c: ContainerCache) => string;
      key4: (c: ContainerCache) => () => 'someString';
    };

    const m = ModuleBuilder.empty('someModule').append(
      _ => {
        expectType<TypeEqual<typeof _, {}>>(true);

        return dummy('key1', 123);
      },
      _ => {
        expectType<TypeEqual<typeof _, Pick<ExpectedType, 'key1'>>>(true);

        return dummy('key2', true);
      },
      _ => {
        expectType<TypeEqual<typeof _, Pick<ExpectedType, 'key1' | 'key2'>>>(true);

        return dummy('key3', 'string');
      },
      _ => {
        expectType<TypeEqual<typeof _, Pick<ExpectedType, 'key1' | 'key2' | 'key3'>>>(true);

        return dummy('key4', () => 'someString');
      },
    );
  });
});
