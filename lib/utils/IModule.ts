import {PathFunction} from "./Path";


export type ModuleGetKey<MM, MR> = keyof (MM & MR);
export type Resolver<CONTAINER, OUT> = (container:CONTAINER) => OUT;


export type MaterializedModule2<D, M extends ModulesRegistry> = D & {
    [K in keyof M]:MaterializedModule2<ExtractMR<M[K]>, ExtractR<M[K]>>;
}

export type ExtractMR<M> = M extends IModule<infer MR, any> ? MR : never;
export type ExtractR<M> = M extends IModule<any, infer R> ? R : never;

export type ResolversRegistry<CONTAINER, D> = {
    [K in keyof D]:Resolver<CONTAINER, D[K]>;
}

export type ModulesRegistry = {
    [key:string]:IModule<any, any>
}

export interface IModule<D = {}, M extends ModulesRegistry = {}, C = {}> {
    hasModule(key:keyof M):boolean;
    isDeclared(key:keyof D):boolean;

    get<K extends ModuleGetKey<M, D>>(key:K):MaterializedModule2<D, M>[K]

    get2:PathFunction<MaterializedModule2<D, M>>;

    declare<K extends string, V, C1>(key:K, factory:(container:MaterializedModule2<D, M>, C1) => V):IModule<D & Record<K, V>, M, C & C1>
    import<K extends string, M1 extends IModule>(key:K, mod2:M1):IModule<D, M & Record<K, M1>>
}