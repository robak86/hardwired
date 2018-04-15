import {PathFunction} from "./utils/Path";
import {Module} from "./Module";


// export type ModuleGetKey<MM, MR> = keyof (MM & MR);
//
// export type MaterializedModule<D, M extends ModulesRegistry> =  {
//     [K in keyof M]:MaterializedModule<ExtractMR<M[K]>, ExtractR<M[K]>>;
// } & D
//
// export type ExtractMR<M> = M extends IModule<infer MR, any> ? MR : never;
// export type ExtractR<M> = M extends IModule<any, infer R> ? R : never;
//
//
// export type ModulesRegistry = {
//     [key:string]:IModule<any, any>
// }
//
// export interface IModule<D = {}, M extends ModulesRegistry = {}, C = {}> {
//     id:string;
//     hasModule(key:keyof M):boolean;
//     isDeclared(key:keyof D):boolean;
//
//     get<K extends ModuleGetKey<M, D>>(key:K):MaterializedModule<D, M>[K]
//
//     get2:PathFunction<MaterializedModule<D, M>>;
//
//     declare<K extends string, V, C1>(key:K, factory:(container:MaterializedModule<D, M>, C1) => V):IModule<D & Record<K, V>, M, C & C1>
//     import<K extends string, M1 extends IModule>(key:K, mod2:M1):IModule<D, M & Record<K, M1>>
//
//     checkout(ctx:C):IMaterializedContainer<D, M, C>
// }
//
// export interface IMaterializedContainer<D = {}, M extends ModulesRegistry = {}, C = {}> {
//     get:PathFunction<MaterializedModule<D, M>>
// }