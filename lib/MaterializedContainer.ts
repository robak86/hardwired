import {PathFunction} from "./utils";
import {DependencyResolver, DependencyResolverFunction} from "./DependencyResolver";
import {MaterializedModule, Module, ModulesRegistry} from "./Module";


export type DependencyResolversRegistry<D> = {
    [K in keyof D]:DependencyResolverFunction<any, any, any>;
}

// export type Module

export class MaterializedContainer<D = {}, M extends ModulesRegistry = {}, C = {}> {
    private cache:{ [key:string]:any } = {};

    constructor(private declarationsResolvers:DependencyResolversRegistry<D>,
                private injectedModules:M,
                private context:C) {}

    // get:PathFunction<MaterializedModule<D, M>> = (...args:any[]) => {
    //     return args.reduce((prev, currentKey) => {
    //         if (prev) {
    //             return prev[currentKey];
    //         } else {
    //             return this.getChild(this.cache, currentKey);
    //         }
    //     }, null);
    // };


    get<K extends keyof D>(key:K):D[K] {
        return this.getChild(this.cache, key);
    }


    import<D1, M1 extends ModulesRegistry, C1, K extends keyof D1>(module:Module<D1, M1, C1>, key:K):D1[K] {
        return this.getExternal(this.cache, module, key);
    }

    private getProxiedAccessor = (cache) => {


        return {
            get: (key:string) => {
                return this.getChild(cache, key);
            },

            ext: (otherModule:Module<any, any, any>, key:string) => {
                return this.getExternal(cache, otherModule, key);
            }
        };
    };

    protected getExternal = (cache, otherModule:Module<any, any, any>, key:string) => {
        if (this.injectedModules[otherModule.identity]){
            otherModule = this.injectedModules[otherModule.identity]
        }

        if (cache[otherModule.id]) {
            return cache[otherModule.id].getChild(cache, key)
        } else {
            let childMaterializedModule:any = otherModule.checkout(this.context);
            cache[otherModule.id] = childMaterializedModule;
            return childMaterializedModule.getChild(cache, key); //TODO: we have to pass cache !!!!
        }
    };


    protected getChild = (cache, localKey) => {
        if (this.declarationsResolvers[localKey]) {
            let declarationResolver:DependencyResolver = this.declarationsResolvers[localKey];

            if (cache[declarationResolver.id]) {
                return cache[declarationResolver.id]
            } else {
                let instance = declarationResolver.get(this.getProxiedAccessor(cache), this.context);
                cache[declarationResolver.id] = instance;
                return instance;
            }
        }
    }
}