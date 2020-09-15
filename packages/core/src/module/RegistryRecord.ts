import { DependencyResolver } from '../resolvers/DependencyResolver';
import { AbstractModuleResolver } from '../resolvers/AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';
import { EventsEmitter } from '../utils/EventsEmitter';

// TODO: rename -> Instance|Definition|Def (the shorter the better for types errors messages?)
export class DependencyFactory<T> {
  private invalidateEvents = new EventsEmitter();
  constructor(public get: (context: ContainerContext) => T) {}

  notifyInvalidated() {
    this.invalidateEvents.emit();
  }
  onInvalidate(listener: () => void): () => void {
    return this.invalidateEvents.add(listener);
  }
}

export type DependencyResolverFactory<T> = (ctx: RegistryRecord) => DependencyResolver<T>;

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
    [K in keyof T]: (...args: any[]) => DependencyResolver<any>;
  };

  type ModuleResolvers<T extends RegistryRecord> = {
    [K in keyof ModuleResolversKeys<T>]: AbstractModuleResolver<any>;
  };
}
