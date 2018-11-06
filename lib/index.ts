import {ModuleContext, ModuleDeclarations, ModuleImports, Module} from "./Module";
import {Container} from "./Container";
import {curry, CurriedFunction3} from 'lodash';


export * from './Module';
export * from './Container'
export * from './utils';


export function module(name:string):Module {
    return new Module(name);
}


//TODO: consider completely removing the m parameter. Create empty container instead and instantiate all dependencies via deepGet
//TODO: investigate how to pass context in such case? and how to make it typesafe ?!
export function container<MOD extends Module<any, any, any>>(m:MOD, ctx:ModuleContext<MOD>):Container<ModuleDeclarations<MOD>, ModuleImports<MOD>, ModuleContext<MOD>> {
    return new Container(
        (m as any).declarations as any,
        (m as any).imports as any,
        ctx as any);
}

//TODO: ctx should be typesafe. we should forbid calling deepGet with modules requiring different context than the context passed here
export function emptyContainer(ctx:any):Container<any, any, any>{
    return container(module('__moduleForEmptyContainer'), ctx); //TODO: refactor - one should not create empty module for creating empty container;
}


export interface WithContainerFn {
    <MOD extends Module<any, any, any>, K extends keyof ModuleDeclarations<MOD>, CTX extends ModuleContext<MOD>>(module:MOD, def:K):(ctx:CTX) => ModuleDeclarations<MOD>[K]
    <MOD extends Module<any, any, any>, K extends keyof ModuleDeclarations<MOD>, CTX extends ModuleContext<MOD>>(module:MOD, def:K, ctx:CTX):ModuleDeclarations<MOD>[K]

}

//TODO: make it type-safe
export const withContainer:WithContainerFn = curry(<MOD extends Module<any, any, any>, K extends keyof ModuleDeclarations<MOD>, CTX extends ModuleContext<MOD>>(module:MOD, def:K, ctx:CTX) => {
    return container(module, ctx).get(def);
});