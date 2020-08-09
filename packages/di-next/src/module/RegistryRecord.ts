import { DependencyFactory } from '../draft';
import { DependencyResolver } from '../resolvers/DependencyResolver';

export type RegistryRecord = Record<string, DependencyFactory<any> | Record<string, DependencyFactory<any>>>;

export declare namespace RegistryRecord {
  type Materialized<T extends RegistryRecord> = {
    [K in keyof T]: {};
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
}
