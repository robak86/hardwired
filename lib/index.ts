import {ExtractContext, ExtractMR, ExtractR, Module, ModulesRegistry} from "./Module";
import {MaterializedContainer} from "./MaterializedContainer";

export * from './Module';
export * from './MaterializedContainer'
export * from './IModule';
export * from './utils';

//TODO: make sure that there won't be any collisions!!!!
export function module(name:string):Module {
    return new Module(name);
}



export function container<MOD extends Module<any, any, any>>(m:MOD, ctx:ExtractContext<MOD>):MaterializedContainer<ExtractMR<MOD>, ExtractR<MOD>, ExtractContext<MOD>> {
    return new MaterializedContainer(
        (m as any).declarations as any,
        (m as any).imports as any,
        ctx as any);
}