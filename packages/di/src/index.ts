import { ModuleRegistry } from './module/ModuleRegistry';
import { BaseModuleBuilder } from './builders/BaseModuleBuilder';

export * from './module/Module';
export * from './container/Container';
export * from './utils';

export { singleton } from './builders/SingletonBuilder';
export { value } from './builders/ValueBuilder';
export { transient } from './builders/TransientBuilder';
export { imports } from './builders/ImportsBuilder';
export { tuple } from './utils/tuple';

export { GlobalSingletonResolver } from './resolvers/global-singleton-resolver';

export type { ModuleBuilder } from './builders/ModuleBuilder';

export { BaseModuleBuilder } from './builders/BaseModuleBuilder';
export type { FlattenModules } from './module/ModuleRegistry';
export type { ModuleRegistryImports } from './module/ModuleRegistry';
export type { ModuleRegistryImportsKeys } from './module/ModuleRegistry';
export type { ModuleRegistryContext } from './module/ModuleRegistry';
export type { ModuleRegistryContextKeys } from './module/ModuleRegistry';
export type { ModuleRegistryDefinitions } from './module/ModuleRegistry';
export type { ModuleRegistryDefinitionsKeys } from './module/ModuleRegistry';
export type { ModuleRegistry } from './module/ModuleRegistry';
export type { RequiresDefinition } from './module/ModuleRegistry';
export type { Definition } from './module/ModuleRegistry';
export type { MaterializedModuleEntries } from './module/ModuleRegistry';
export type { MaterializedImports } from './module/ModuleRegistry';
export type { MaterializedDefinitions } from './module/ModuleRegistry';
export type { FilterPrivateFields } from './module/ModuleUtils';
export type { ClassType } from './module/ModuleUtils';
export type { NextModuleImport } from './module/ModuleUtils';
export type { NextModuleDefinition } from './module/ModuleUtils';
export type { NotDuplicatedKeys } from './module/ModuleUtils';
export type { NotDuplicated } from './module/ModuleUtils';
