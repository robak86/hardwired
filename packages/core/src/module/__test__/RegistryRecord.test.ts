import { DependencyFactory, RegistryRecord } from '../RegistryRecord';
import { ContainerContext } from '../../container/ContainerContext';
import { expectType, TypeEqual } from 'ts-expect';

describe(`RegistryRecord`, () => {
  describe(`Module`, () => {
    it(`returns correct type`, async () => {
      type Registry = {
        a: DependencyFactory<number>;
        imported: {
          b: DependencyFactory<boolean>;
        };
        imported2: {
          c: DependencyFactory<number>;
          nested: {
            d: DependencyFactory<string>;
          };
        };
      };

      type Modules = RegistryRecord.Flatten<Registry>;

      type Expected =
        | {
            b: DependencyFactory<boolean>;
          }
        | {
            c: DependencyFactory<number>;
            nested: {
              d: DependencyFactory<string>;
            };
          }
        | {
            d: DependencyFactory<string>;
          };

      expectType<TypeEqual<Modules, Expected>>(true);
    });
  });

  describe(`RegistryRecord.DependencyResolversKeys`, () => {
    it(`returns correct type`, async () => {
      type Registry = {
        a: DependencyFactory<123>;
        imported: {
          b: DependencyFactory<true>;
        };
      };

      type Keys = RegistryRecord.DependencyResolversKeys<Registry>;

      expectType<TypeEqual<Keys, 'a'>>(true);
    });
  });

  describe(`RegistryRecord.ModuleResolversKeys`, () => {
    it(`returns correct type`, async () => {
      type Registry = {
        a: DependencyFactory<123>;
        imported: {
          b: DependencyFactory<true>;
        };
      };

      type Keys = RegistryRecord.ModuleResolversKeys<Registry>;

      expectType<TypeEqual<Keys, 'imported'>>(true);
    });
  });
});
