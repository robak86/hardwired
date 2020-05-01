import { Module } from './module/module';
import { Container } from './container/Container';
import {
  DefinitionsRecord,
  ExtractModuleRegistryDeclarations,
  ImportsRecord,
  ModuleEntries,
} from './module/module-entries';

export * from './module/module';
export * from './container/Container';
export * from './utils';

export function module<CTX = {}>(name: string): Module<{}, {}, CTX> {
  return new Module(ModuleEntries.empty(name));
}

//TODO: consider completely removing the m parameter. Create empty container instead and instantiate all dependencies via deepGet
//TODO: investigate how to pass context in such case? and how to make it typesafe ?!
export function container<I extends ImportsRecord, D extends DefinitionsRecord, CTX>(
  m: Module<I, D, CTX>,
  ctx: CTX,
): Container<I, D, any> {
  return new Container((m as any).definitions, ctx as any);
}

//TODO: ctx should be typesafe. we should forbid calling deepGet with modules requiring different context than the context passed here
export function emptyContainer(ctx: any): Container<any, any, any> {
  return container(module('__moduleForEmptyContainer'), ctx); //TODO: refactor - one should not create empty module for creating empty container;
}

// export interface WithContainerFn {
//     <MOD extends Module<any, any, any>, K extends keyof ExtractModuleRegistryDeclarations<MOD>, CTX extends ModuleContext<MOD>>(module:MOD, def:K):(ctx:CTX) => ExtractModuleRegistryDeclarations<MOD>[K]
//     <MOD extends Module<any, any, any>, K extends keyof ExtractModuleRegistryDeclarations<MOD>, CTX extends ModuleContext<MOD>>(module:MOD, def:K, ctx:CTX):ExtractModuleRegistryDeclarations<MOD>[K]
// }

//TODO: make it type-safe
// export const withContainer:WithContainerFn = curry(<MOD extends Module<any, any, any>, K extends keyof ExtractModuleRegistryDeclarations<MOD>, CTX extends ModuleContext<MOD>>(module:MOD, def:K, ctx:CTX) => {
//     return container(module, ctx).get(def);
// });

export { DefinitionsRecord } from './module/module-entries';
export { ImportsRecord } from './module/module-entries';
export { ExtractModuleRegistryDeclarations } from './module/module-entries';
export { MaterializedModuleEntries } from './module/module-entries';
