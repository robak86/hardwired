import { DefinitionResolver } from '../resolvers/DependencyResolver';
import { ModuleBuilder } from './ModuleBuilder';
import { InstanceLegacy } from '../resolvers/abstract/InstanceLegacy';

// TODO: rename to ModuleEntries | ModuleDefinitions ?
export interface RegistryRecord {
  [property: string]: InstanceLegacy<any> | RegistryRecord;
}

export declare namespace RegistryRecord {
  type Materialized<T extends RegistryRecord> = {
    [K in keyof T]: T[K] extends InstanceLegacy<infer TValue> ? TValue : never;
  };

  type Flatten<T extends RegistryRecord> = {
    [K in ModulesKeys<T>]: T[K] | Flatten<T[K]>;
  }[ModulesKeys<T>];

  type ModulesKeys<T extends RegistryRecord> = {
    [K in keyof T]: T[K] extends RegistryRecord ? K : never;
  }[keyof T];

  type ModuleResolversKeys<T extends RegistryRecord> = {
    [K in keyof T]: T[K] extends Record<string, InstanceLegacy<any>> ? K : never;
  }[keyof T];

  type DependencyResolversKeys<T extends RegistryRecord> = {
    [K in keyof T]: T[K] extends InstanceLegacy<any> ? K : never;
  }[keyof T];

  type Resolvers<T extends RegistryRecord> = {
    [K in keyof T]: (...args: any[]) => DefinitionResolver;
  };

  type DefinitionsResolvers<T extends RegistryRecord> = T;

  type ModuleResolvers<T extends RegistryRecord> = {
    [K in keyof ModuleResolversKeys<T>]: ModuleBuilder<any>;
  };
}
