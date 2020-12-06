import { RegistryRecord } from '../RegistryRecord';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceLegacy } from '../../resolvers/abstract/InstanceLegacy';
import { AbstractModuleResolver, Instance } from '../../resolvers/abstract/AbstractResolvers';
import { MaterializedRecord } from '../ModuleBuilder';

describe(`RegistryRecord`, () => {
  describe(`RegistryRecord.DependencyResolversKeys`, () => {
    it(`returns correct type`, async () => {
      type Registry = {
        a: InstanceLegacy<123>;
        imported: {
          b: InstanceLegacy<true>;
        };
      };

      type Keys = RegistryRecord.DependencyResolversKeys<Registry>;

      expectType<TypeEqual<Keys, 'a'>>(true);
    });
  });

  describe(`RegistryRecord.ModuleResolversKeys`, () => {
    it(`returns correct type`, async () => {
      type Registry = {
        a: InstanceLegacy<123>;
        imported: {
          b: InstanceLegacy<true>;
        };
      };

      type Keys = RegistryRecord.ModuleResolversKeys<Registry>;

      expectType<TypeEqual<Keys, 'imported'>>(true);
    });
  });
});
