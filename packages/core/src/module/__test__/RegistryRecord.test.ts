import { RegistryRecord } from '../RegistryRecord';
import { ContainerContext } from '../../container/ContainerContext';
import { expectType, TypeEqual } from 'ts-expect';

describe(`RegistryRecord`, () => {
  describe(`Module`, () => {
    it(`returns correct type`, async () => {
      const registry = {
        a: (ctx: ContainerContext) => 123,
        imported: {
          b: (ctx: ContainerContext) => true,
        },
        imported2: {
          c: (ctx: ContainerContext) => 123,
          nested: {
            d: (ctx: ContainerContext) => 'somestring',
          },
        },
      };

      type Modules = RegistryRecord.Flatten<typeof registry>;

      type Expected =
        | {
            b: (ctx: ContainerContext) => boolean;
          }
        | {
            c: (ctx: ContainerContext) => number;
            nested: {
              d: (ctx: ContainerContext) => string;
            };
          }
        | {
            d: (ctx: ContainerContext) => string;
          };

      expectType<TypeEqual<Modules, Expected>>(true);
    });
  });

  describe(`RegistryRecord.DependencyResolversKeys`, () => {
    it(`returns correct type`, async () => {
      const registry = {
        a: (ctx: ContainerContext) => 123,
        imported: {
          b: (ctx: ContainerContext) => true,
        },
      };

      type Keys = RegistryRecord.DependencyResolversKeys<typeof registry>;

      expectType<TypeEqual<Keys, 'a'>>(true);
    });
  });

  describe(`RegistryRecord.ModuleResolversKeys`, () => {
    it(`returns correct type`, async () => {
      const registry = {
        a: (ctx: ContainerContext) => 123,
        imported: {
          b: (ctx: ContainerContext) => true,
        },
      };

      type Keys = RegistryRecord.ModuleResolversKeys<typeof registry>;

      expectType<TypeEqual<Keys, 'imported'>>(true);
    });
  });
});
