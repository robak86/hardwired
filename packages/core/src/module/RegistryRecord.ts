import { DefinitionResolver } from "../resolvers/DependencyResolver";
import { DependencyResolverEvents } from "../resolvers/AbstractDependencyResolver";
import { ContainerContext } from "../container/ContainerContext";
import { Module } from "./Module";

// TODO: rename -> Instance|Definition|Def (the shorter the better for types errors messages?)

let id = 1;

export class DependencyFactory<T> {
  private id = (id += 1);

  constructor(public get: (context: ContainerContext) => T, private getEvents: () => DependencyResolverEvents) {}

  get events(): DependencyResolverEvents {
    return this.getEvents();
  }
}

// export type DependencyResolverFactory<T> = (ctx: RegistryRecord) => DependencyResolver<T>;

// TODO: rename to ModuleEntries | ModuleDefinitions ?
export interface RegistryRecord {
  [property: string]: DependencyFactory<any> | RegistryRecord;
}

export declare namespace RegistryRecord {
  type Materialized<T extends RegistryRecord> = {
    [K in keyof T]: T[K] extends DependencyFactory<infer TValue> ? TValue : never;
  };

  type Flatten<T extends RegistryRecord> = {
    [K in ModulesKeys<T>]: T[K] | Flatten<T[K]>;
  }[ModulesKeys<T>];

  type ModulesKeys<T extends RegistryRecord> = {
    [K in keyof T]: T[K] extends RegistryRecord ? K : never;
  }[keyof T];

  type ModuleResolversKeys<T extends RegistryRecord> = {
    [K in keyof T]: T[K] extends Record<string, DependencyFactory<any>> ? K : never;
  }[keyof T];

  type DependencyResolversKeys<T extends RegistryRecord> = {
    [K in keyof T]: T[K] extends DependencyFactory<any> ? K : never;
  }[keyof T];

  type Resolvers<T extends RegistryRecord> = {
    [K in keyof T]: (...args: any[]) => DefinitionResolver;
  };

  type DefinitionsResolvers<T extends RegistryRecord> = T;

  type ModuleResolvers<T extends RegistryRecord> = {
    [K in keyof ModuleResolversKeys<T>]: Module<any>;
  };
}
