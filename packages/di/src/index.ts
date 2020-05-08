import { Module } from './module/Module';
import { Container } from './container/Container';
import { DefinitionsSet } from './module/DefinitionsSet';
import { ModuleRegistry } from './module/ModuleRegistry';
import { BaseModuleBuilder } from './builders/BaseModuleBuilder';
import { FunctionModuleBuilder } from './builders/FunctionBuilder';
import { ModuleBuilder } from "./builders/ModuleBuilder";

export * from './module/Module';
export * from './container/Container';
export * from './utils';

export function module<CTX = {}>(name: string): Module<{}> {
  return new Module(DefinitionsSet.empty(name));
}

//TODO: investigate how to pass context in such case? and how to make it typesafe ?!
// TODO: currently in order to have correct TRegistry type we need pass union of exact implementations of ModuleBuilder - which forbids custom builders in user space
export function container<TRegistry extends ModuleRegistry>(
  m: FunctionModuleBuilder<TRegistry> | Module<TRegistry>,
  // m: ModuleBuilder<TRegistry>,
  ctx?: any,
): Container<TRegistry> {
  return new Container((m as any).registry, ctx);
}

//TODO: make it type-safe
// export const withContainer:WithContainerFn = curry(<MOD extends Module<any, any, any>, K extends keyof ExtractModuleRegistryDeclarations<MOD>, CTX extends ModuleContext<MOD>>(module:MOD, def:K, ctx:CTX) => {
//     return container(module, ctx).get(def);
// });
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
