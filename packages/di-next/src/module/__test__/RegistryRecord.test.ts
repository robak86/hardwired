import { RegistryRecord } from "../RegistryRecord";
import { ContainerCache } from "../../container/container-cache";
import {
  AbstractDependencyResolver,
  AbstractRegistryDependencyResolver
} from "../../resolvers/AbstractDependencyResolver";
import { ModuleRegistry } from "../ModuleRegistry";
import { DependencyFactory } from "../../draft";
import { DependencyResolver } from "../../resolvers/DependencyResolver";
import { expectType, TypeEqual } from "ts-expect";
import { RegistryRecordDependencyResolverKeys, RegistryRecordRegistryResolverKeys } from "../../builders/ModuleBuilder";

describe(`RegistryRecord`, () => {
  class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
    constructor(value: TValue) {
      super();
    }

    build(registry: ModuleRegistry<any>): DependencyFactory<TValue> {
      throw new Error('Implement me');
    }
  }

  class RegistryResolver<TValue extends RegistryRecord> extends AbstractRegistryDependencyResolver<TValue> {
    constructor(registry) {
      super(registry);
    }

    build(): ModuleRegistry<TValue> {
      throw new Error('Implement me');
    }

    forEach(iterFn: (resolver: DependencyResolver<any>) => any) {}
  }

  const dependency = <TValue>(value: TValue): DummyResolver<TValue> => {
    return new DummyResolver<TValue>(value);
  };

  const registryDependency = <TValue extends RegistryRecord>(value: TValue): RegistryResolver<TValue> => {
    return new RegistryResolver<TValue>(value);
  };

  describe(`RegistryRecordDependencyResolverKeys`, () => {
    it(`returns correct type`, async () => {
      const registry = {
        a: (ctx: ContainerCache) => 123,
        imported: {
          b: (ctx: ContainerCache) => true,
        },
      };

      type Keys = RegistryRecordDependencyResolverKeys<typeof registry>;

      expectType<TypeEqual<Keys, 'a'>>(true);
    });
  });

  describe(`RegistryRecordRegistryResolverKeys`, () => {
    it(`returns correct type`, async () => {
      const registry = {
        a: (ctx: ContainerCache) => 123,
        imported: {
          b: (ctx: ContainerCache) => true,
        },
      };

      type Keys = RegistryRecordRegistryResolverKeys<typeof registry>;

      expectType<TypeEqual<Keys, 'imported'>>(true);
    });
  });
});
