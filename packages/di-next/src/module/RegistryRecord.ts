import { DependencyFactory } from '../draft';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { AbstractModuleResolver } from '../resolvers/AbstractDependencyResolver';

// export type RegistryRecord = {
//   [K in keyof string]: DependencyFactory<any> | RegistryRecord
// }

// export type RegistryRecord = Record<string, DependencyFactory<any> | Record<string, DependencyFactory<any>>>;
// export type RegistryRecord = Record<string, DependencyFactory<any> | RegistryRecord>;

export interface RegistryRecord {
  [property: string]:  DependencyFactory<any> | RegistryRecord;
}



export declare namespace RegistryRecord {
  type Materialized<T extends RegistryRecord> = {
    [K in keyof T]: T[K] extends DependencyFactory<infer TValue> ? TValue : never;
  };

  type ModuleResolversKeys<T extends RegistryRecord> = {
    [K in keyof T]: T[K] extends Record<string, DependencyFactory<any>> ? K : never;
  }[keyof T];

  type DependencyResolversKeys<T extends RegistryRecord> = {
    [K in keyof T]: T[K] extends DependencyFactory<any> ? K : never;
  }[keyof T];

  type Resolvers<T extends RegistryRecord> = {
    [K in keyof T]: (...args: any[]) => DependencyResolver<any>;
  };

  type ModuleResolvers<T extends RegistryRecord> = {
    [K in keyof ModuleResolversKeys<T>]: AbstractModuleResolver<any>;
  };
}
