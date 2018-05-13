import {DependencyResolver, DependencyResolverFunction} from "./DependencyResolver";
import {ExtractMR, Module, ModulesRegistry} from "./Module";
import {values} from 'lodash';
import {container} from "./index";

export type DependencyResolversRegistry<D> = {
    [K in keyof D]:DependencyResolverFunction<any, any, any>;
}

// export type RegisteredModules<T extends ModulesRegistry> = T[keyof T];

export class MaterializedContainer<D = {}, M extends ModulesRegistry = {}, C = {}> {
    private cache:{ [key:string]:any } = {};

    constructor(private declarationsResolvers:DependencyResolversRegistry<D>,
                private imports:M,
                private context:C) {}

    get = <K extends keyof D>(key:K):D[K] => {
        return this.getChild(this.cache, key);
    };

    deepGet<M1 extends Module<any, any, any>, K extends keyof ExtractMR<M1>>(module:M1, key:K):ExtractMR<M1>[K] {
        let childModule = this.findModule(module.identity);

        if (!childModule){
            console.warn('deepGet called with module which is not imported by any descendant module')
            childModule = module;
        }

        if (this.cache[childModule.id]) {
            return this.cache[childModule.id].getChild(this.cache, key);
        } else {
            let childMaterializedModule:any = container(childModule,this.context);
            this.cache[childModule.id] = childMaterializedModule;
            return childMaterializedModule.getChild(this.cache, key); //TODO: we have to pass cache !!!!
        }
    }

    private findModule(moduleIdentity):Module<any,any,any> | undefined {
        let found = values(this.imports).find(m => m.identity === moduleIdentity);
        if (found) {
            return found;
        }

        for (let importKey in this.imports) {
            const targetContainer = container(this.imports[importKey],this.context as any);
            let found = targetContainer.findModule(moduleIdentity);
            if (found) {
                return found;
            }
        }

        return undefined;
    }

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
                let childMaterializedModule:any = container(childModule,this.context);
                cache[childModule.id] = childMaterializedModule;
                return childMaterializedModule.getProxiedAccessor(cache); //TODO: we have to pass cache !!!!
            }
        }
    }
}