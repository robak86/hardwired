import {PathFunction} from "./utils";
import {DependencyResolver, DependencyResolverFunction} from "./DependencyResolver";
import {MaterializedModule, ModulesRegistry} from "./Module";


export type DependencyResolversRegistry<D> = {
    [K in keyof D]:DependencyResolverFunction<any, any, any>;
}

// export type Module

export class MaterializedContainer<D = {}, M extends ModulesRegistry = {}, C = {}> {
    private cache:{ [key:string]:any } = {};

    constructor(private declarationsResolvers:DependencyResolversRegistry<D>,
                private imports:M,
                private context:C) {}

    get = <K extends keyof D>(key:K):D[K] => {
        return this.getChild(this.cache, key);
    };

    private getProxiedAccessor(cache) {
        const self = this;

        return new Proxy({} as any, {
            get(target, property) {
                let returned = self.getChild(cache, property);
                return returned;
            }
        })
    }

    protected getChild(cache, localKey) {
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

        if (this.imports[localKey]) {
            let childModule = this.imports[localKey];
            if (cache[childModule.id]) {
                return cache[childModule.id].getProxiedAccessor(cache)
            } else {
                let childMaterializedModule:any = childModule.checkout(this.context);
                cache[childModule.id] = childMaterializedModule;
                return childMaterializedModule.getProxiedAccessor(cache); //TODO: we have to pass cache !!!!
            }
        }
    }
}