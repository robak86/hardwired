import { RegistryRecord } from "../RegistryRecord";
import { expectType, TypeEqual } from "ts-expect";
import { Instance } from "../../resolvers/abstract/Instance";

describe(`RegistryRecord`, () => {
  describe(`Module`, () => {
    it(`returns correct type`, async () => {
      type Registry = {
        a: Instance<number>;
        imported: {
          b: Instance<boolean>;
        };
        imported2: {
          c: Instance<number>;
          nested: {
            d: Instance<string>;
          };
        };
      };

      type Modules = RegistryRecord.Flatten<Registry>;

      type Expected =
        | {
            b: Instance<boolean>;
          }
        | {
            c: Instance<number>;
            nested: {
              d: Instance<string>;
            };
          }
        | {
            d: Instance<string>;
          };

      expectType<TypeEqual<Modules, Expected>>(true);
    });
  });

  describe(`RegistryRecord.DependencyResolversKeys`, () => {
    it(`returns correct type`, async () => {
      type Registry = {
        a: Instance<123>;
        imported: {
          b: Instance<true>;
        };
      };

      type Keys = RegistryRecord.DependencyResolversKeys<Registry>;

      expectType<TypeEqual<Keys, 'a'>>(true);
    });
  });

  describe(`RegistryRecord.ModuleResolversKeys`, () => {
    it(`returns correct type`, async () => {
      type Registry = {
        a: Instance<123>;
        imported: {
          b: Instance<true>;
        };
      };

      type Keys = RegistryRecord.ModuleResolversKeys<Registry>;

      expectType<TypeEqual<Keys, 'imported'>>(true);
    });
  });
});
