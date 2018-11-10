import {Module, ModuleContext} from "./Module";
import {Container} from "./Container";
import {curry} from 'lodash';
import {
    AsyncDependenciesRegistry,
    DependenciesRegistry,
    ExtractModuleRegistryDeclarations,
    ImportsRegistry,
    ModuleEntries
} from "./module-entries";


export * from './Module';
export * from './Container'
export * from './utils';


export function module(name:string):Module {
    return new Module(ModuleEntries.build(name));
}


//TODO: consider completely removing the m parameter. Create empty container instead and instantiate all dependencies via deepGet
//TODO: investigate how to pass context in such case? and how to make it typesafe ?!
export function container<I extends ImportsRegistry, D extends DependenciesRegistry, AD extends AsyncDependenciesRegistry>(m:Module<I, D, AD>, ctx:any):Container<I, D, AD, any> {
    return new Container(
        m.entries,
        ctx as any
    );
}

export async function asyncContainer<I extends ImportsRegistry, D extends DependenciesRegistry, AD extends AsyncDependenciesRegistry>(m:Module<I, D, AD>, ctx:any):Promise<Container<I, D, AD>> {
    let container = new Container(m.entries, ctx as any);
    await container.initAsyncDependencies();
    return container as any;
}

//TODO: ctx should be typesafe. we should forbid calling deepGet with modules requiring different context than the context passed here
export function emptyContainer(ctx:any):Container<any, any, any> {
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
export {AsyncDependenciesRegistry} from "./module-entries";
export {DependenciesRegistry} from "./module-entries";
export {ImportsRegistry} from "./module-entries";
export {ExtractModuleRegistryDeclarations} from "./module-entries";
export {MaterializedModuleEntries} from "./module-entries";