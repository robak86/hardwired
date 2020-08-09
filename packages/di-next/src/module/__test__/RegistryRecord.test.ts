import { RegistryRecord } from '../RegistryRecord';
import { ContainerCache } from '../../container/container-cache';
import { AbstractDependencyResolver, AbstractModuleResolver } from '../../resolvers/AbstractDependencyResolver';
import { ModuleRegistry } from '../ModuleRegistry';
import { DependencyFactory } from '../../draft';
import { DependencyResolver } from '../../resolvers/DependencyResolver';
import { expectType, TypeEqual } from 'ts-expect';

describe(`RegistryRecord`, () => {
  class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
    constructor(value: TValue) {
      super();
    }

    build(registry: ModuleRegistry<any>): DependencyFactory<TValue> {
      throw new Error('Implement me');
    }
  }

  class RegistryResolver<TValue extends RegistryRecord> extends AbstractModuleResolver<TValue> {
    constructor(registry) {
      super(registry);
    }

    build(): TValue {
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

  describe(`RegistryRecord.DependencyResolversKeys`, () => {
    it(`returns correct type`, async () => {
      const registry = {
        a: (ctx: ContainerCache) => 123,
        imported: {
          b: (ctx: ContainerCache) => true,
        },
      };

      type Keys = RegistryRecord.DependencyResolversKeys<typeof registry>;

      expectType<TypeEqual<Keys, 'a'>>(true);
    });
  });

  describe(`RegistryRecord.ModuleResolversKeys`, () => {
    it(`returns correct type`, async () => {
      const registry = {
        a: (ctx: ContainerCache) => 123,
        imported: {
          b: (ctx: ContainerCache) => true,
        },
      };

      type Keys = RegistryRecord.ModuleResolversKeys<typeof registry>;

      expectType<TypeEqual<Keys, 'imported'>>(true);
    });
  });
});
