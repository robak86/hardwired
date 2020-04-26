import { Module } from './module/module';
import { Container } from './container/Container';
import {
  AsyncDefinitionsRecord,
  DefinitionsRecord,
  ExtractModuleRegistryDeclarations,
  ImportsRecord,
  ModuleEntries,
} from './module/module-entries';

export * from './module/module';
export * from './container/Container';
export * from './utils';

export function module<CTX = {}>(name: string): Module<{}, {}, {}, CTX> {
  return new Module(ModuleEntries.empty(name));
}

//TODO: consider completely removing the m parameter. Create empty container instead and instantiate all dependencies via deepGet
//TODO: investigate how to pass context in such case? and how to make it typesafe ?!
export function container<I extends ImportsRecord, D extends DefinitionsRecord, AD extends AsyncDefinitionsRecord, CTX>(
  m: Module<I, D, AD, CTX>,
  ctx: CTX,
): Container<I, D, AD, any> {
  return new Container((m as any).definitions, ctx as any);
}

export async function asyncContainer<
  I extends ImportsRecord,
  D extends DefinitionsRecord,
  AD extends AsyncDefinitionsRecord
>(m: Module<I, D, AD>, ctx: any): Promise<Container<I, D, AD>> {
  let container = new Container(m.entries, ctx as any);
  await container.initAsyncDependencies();
  return container as any;
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
export { AsyncDefinitionsRecord } from './module/module-entries';
export { DefinitionsRecord } from './module/module-entries';
export { ImportsRecord } from './module/module-entries';
export { ExtractModuleRegistryDeclarations } from './module/module-entries';
export { MaterializedModuleEntries } from './module/module-entries';
