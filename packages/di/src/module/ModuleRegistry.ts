import { Thunk, UnwrapThunk } from '../utils/thunk';
import { Module } from './Module';

export type Definition<T> = { definition: T };
export type RequiresDefinition<T> = { requires: T };
export type ModuleRegistry = Record<string, Thunk<Module<any>> | Definition<any> | RequiresDefinition<any>>;
export type ModuleRegistryDefinitionsKeys<T> = { [K in keyof T]: T[K] extends Definition<any> ? K : never }[keyof T];
export type ModuleRegistryDefinitions<T> = { [K in ModuleRegistryDefinitionsKeys<T>]: T[K] };
export type ModuleRegistryContextKeys<T> = {
  [K in keyof T]: T[K] extends RequiresDefinition<any> ? K : never;
}[keyof T];
export type ModuleRegistryContext<T> = { [K in ModuleRegistryContextKeys<T>]: T[K] };
export type MaterializedModuleRegistryContext<TRegistry extends ModuleRegistry> = {
  [K in keyof ModuleRegistryContextKeys<TRegistry>]: ModuleRegistryContextKeys<TRegistry>[K] extends RequiresDefinition<
    infer TContext
  >
    ? TContext
    : never;
};

export type ModuleRegistryImportsKeys<T> = {
  [K in keyof T]: UnwrapThunk<T[K]> extends Module<any> ? K : never;
}[keyof T];
export type ModuleRegistryImports<T> = {
  [K in ModuleRegistryImportsKeys<T>]: UnwrapThunk<T[K]> extends Module<infer R> ? R : never;
};
export type FlattenModules<R extends ModuleRegistry> =
  | R
  | {
      [K in keyof ModuleRegistryImports<R>]: FlattenModules<ModuleRegistryImports<R>[K]>;
    }[keyof ModuleRegistryImports<R>];
export type MaterializedDefinitions<R extends ModuleRegistry> = {
  [K in ModuleRegistryDefinitionsKeys<R>]: ModuleRegistryDefinitions<R>[K] extends Definition<infer TDefinition>
    ? TDefinition
    : never;
};
export type MaterializedImports<R extends ModuleRegistry> = {
  [K in ModuleRegistryImportsKeys<R>]: MaterializedDefinitions<ModuleRegistryImports<R>[K]>;
};
export type MaterializedModuleEntries<R extends ModuleRegistry> = MaterializedDefinitions<R> & MaterializedImports<R>;
