import { RegistryRecord } from "../RegistryRecord";
import { expectType, TypeEqual } from "ts-expect";
import { InstanceLegacy } from "../../resolvers/abstract/InstanceLegacy";

describe(`RegistryRecord`, () => {
  describe(`Module`, () => {
    it(`returns correct type`, async () => {
      type Registry = {
        a: InstanceLegacy<number>;
        imported: {
          b: InstanceLegacy<boolean>;
        };
        imported2: {
          c: InstanceLegacy<number>;
          nested: {
            d: InstanceLegacy<string>;
          };
        };
      };

      type Modules = RegistryRecord.Flatten<Registry>;

      type Expected =
        | {
            b: InstanceLegacy<boolean>;
          }
        | {
            c: InstanceLegacy<number>;
            nested: {
              d: InstanceLegacy<string>;
            };
          }
        | {
            d: InstanceLegacy<string>;
          };

      expectType<TypeEqual<Modules, Expected>>(true);
    });
  });

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
