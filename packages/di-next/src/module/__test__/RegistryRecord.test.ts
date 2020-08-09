import { RegistryRecord } from '../RegistryRecord';
import { ContainerCache } from '../../container/container-cache';
import { expectType, TypeEqual } from 'ts-expect';

describe(`RegistryRecord`, () => {
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
