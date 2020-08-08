import { Thunk, UnwrapThunk } from '../utils/thunk';
import { ModuleBuilder } from '../builders/ModuleBuilder';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { DependencyFactory } from '../draft';
import { AbstractRegistryDependencyResolver } from '../resolvers/AbstractDependencyResolver';

// TODO: group this types mess into namespaces - we don't wanna export so many unbound types
declare namespace Test {
  type Zonk = boolean;
}

type T = Test.Zonk;

export type Definition<T> = { definition: T };
export type RequiresDefinition<T> = { requires: T };
// export type RegistryRecord = Record<string, Thunk<ModuleBuilder<any>> | Definition<any> | RequiresDefinition<any>>;

export type RegistryRecord = Record<string, DependencyFactory<any> | Record<string, DependencyFactory<any>>>;

export type ModuleRegistryDefinitionsKeys<T> = { [K in keyof T]: T[K] extends Definition<any> ? K : never }[keyof T];
export type ModuleRegistryDefinitions<T> = { [K in ModuleRegistryDefinitionsKeys<T>]: T[K] };
// export type ModuleRegistryDefinitionsResolvers<TRegistryRecord extends RegistryRecord> = {
//   [K in ModuleRegistryDefinitionsKeys<TRegistryRecord>]: TRegistryRecord[K] extends Definition<infer TReturn>
//     ? DependencyResolver<TRegistryRecord, TReturn>
//     : never;
// };

export type ModuleRegistryContextKeys<T> = {
  [K in keyof T]: T[K] extends RequiresDefinition<any> ? K : never;
}[keyof T];
export type ModuleRegistryContext<T> = { [K in ModuleRegistryContextKeys<T>]: T[K] };
export type MaterializedModuleRegistryContext<TRegistryRecord extends RegistryRecord> = {
  [K in keyof ModuleRegistryContextKeys<TRegistryRecord>]: ModuleRegistryContextKeys<
    TRegistryRecord
  >[K] extends RequiresDefinition<infer TContext>
    ? TContext
    : never;
};

export type ModuleRegistryImportsKeys<T> = {
  [K in keyof T]: UnwrapThunk<T[K]> extends ModuleBuilder<any> ? K : never;
}[keyof T];

export type ModuleRegistryImports<T> = {
  [K in ModuleRegistryImportsKeys<T>]: UnwrapThunk<T[K]> extends ModuleBuilder<infer R> ? R : never;
};
// export type FlattenModules<R extends RegistryRecord> =
//   | R
//   | {
//       [K in keyof ModuleRegistryImports<R>]: FlattenModules<ModuleRegistryImports<R>[K]>;
//     }[keyof ModuleRegistryImports<R>];

export type MaterializedDefinitions<R extends RegistryRecord> = {
  [K in ModuleRegistryDefinitionsKeys<R>]: ModuleRegistryDefinitions<R>[K] extends Definition<infer TDefinition>
    ? TDefinition
    : never;
};
// export type MaterializedImports<R extends RegistryRecord> = {
//   [K in ModuleRegistryImportsKeys<R>]: MaterializedDefinitions<ModuleRegistryImports<R>[K]>;
// };
// export type MaterializedModuleEntries<TRegistryRecord extends RegistryRecord> = MaterializedDefinitions<TRegistryRecord> & MaterializedImports<TRegistryRecord>;
