import {DependencyResolver} from "./DependencyResolver";
import {ImportsRegistry, MaterializedModule, Module, ModuleDeclarations} from "./Module";
import {container} from "./index";
import {ImmutableMap} from "./immutable-map";
import {unwrapThunk} from "./utils/thunk";

export type DependencyResolversRegistry<D> = {
    [K in keyof D]:DependencyResolver<any, any, any>;
}


interface GetMany<D> {
    <K extends keyof D>(key:K):[D[K]]
    <K extends keyof D, K2 extends keyof D>(key:K, key2:K2):[D[K], D[K2]]
    <K extends keyof D, K2 extends keyof D, K3 extends keyof D>(key:K, key2:K2, key3:K3):[D[K], D[K2], D[K3]]
    <K extends keyof D, K2 extends keyof D, K3 extends keyof D, K4 extends keyof D>(key:K, key2:K2, key3:K3, key4:K4):[D[K], D[K2], D[K3], D[K4]]
}

export class Container<D = {}, M extends ImportsRegistry = {}, C = {}> {
    private cache:{ [key:string]:any } = {};  //TODO: create cache class for managing cache

    constructor(private declarationsResolvers:ImmutableMap<any, DependencyResolversRegistry<D>>,
                private imports:ImmutableMap<any,M>,
                private context:C) {}

    get = <K extends keyof D>(key:K):D[K] => {
        return this.getChild(this.cache, key);
    };

    getMany:GetMany<D> = (...args:any[]) => {
        return args.map(this.get) as any;
    };

    toObject():MaterializedModule<D, M> {
        return this.getProxiedAccessor();
    }

    deepGet<M1 extends Module<any, any, any>, K extends keyof ModuleDeclarations<M1>>(module:M1, key:K):ModuleDeclarations<M1>[K] {
        let childModule = this.findModule(module.moduleId.identity); //TODO: it should be compared using id - because identity doesn't give any guarantee that given dependency is already registered

        if (!childModule) {
            console.warn('deepGet called with module which is not imported by any descendant module');
            childModule = module;
        }

        if (this.cache[childModule.moduleId.id]) {
            return this.cache[childModule.moduleId.id].getChild(this.cache, key);
        } else {
            let childMaterializedModule:any = container(childModule, this.context);
            this.cache[childModule.moduleId.id] = childMaterializedModule;
            return childMaterializedModule.getChild(this.cache, key); //TODO: we have to pass cache !!!!
        }
    }

    private findModule(moduleIdentity):Module<any, any, any> | undefined {
        let found = this.imports.values.find(m => m.moduleId.identity === moduleIdentity);
        if (found) {
            return found;
        }

        for (let importKey in this.imports) {
            const targetContainer = container(this.imports.get(importKey), this.context as any);
            let found = targetContainer.findModule(moduleIdentity);
            if (found) {
                return found;
            }
        }

        return undefined;
    }

    private getProxiedAccessor(cache = this.cache) {
        const self = this;

        return new Proxy({} as any, {
            get(target, property) {
                let returned = self.getChild(cache, property);
                return returned;
            }
        })
    }

    protected getChild(cache, localKey) {
        if (this.declarationsResolvers.hasKey(localKey)) {
            let declarationResolver:DependencyResolver = this.declarationsResolvers.get(localKey);

            if (cache[declarationResolver.id]) {
                return cache[declarationResolver.id]
            } else {
                let instance = declarationResolver.get(this.getProxiedAccessor(cache), this.context);
                cache[declarationResolver.id] = instance;
                return instance;
            }
        }

        if (this.imports.hasKey(localKey)) {
            let childModule = unwrapThunk(this.imports.get(localKey));
            if (cache[childModule.moduleId.id]) {
                return cache[childModule.moduleId.id].getProxiedAccessor(cache)
            } else {
                let childMaterializedModule:any = container(childModule, this.context);
                cache[childModule.moduleId.id] = childMaterializedModule;
                return childMaterializedModule.getProxiedAccessor(cache); //TODO: we have to pass cache !!!!
            }
        }
    }
}