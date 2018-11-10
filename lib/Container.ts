import {DependencyResolver} from "./DependencyResolver";
import {Module} from "./Module";
import {unwrapThunk} from "./utils/thunk";
import {
    AsyncDependenciesRegistry,
    DependenciesRegistry,
    ImportsRegistry,
    MaterializedModuleEntries,
    ModuleEntries,
    ModuleEntriesDependencies
} from "./module-entries";


interface GetMany<D> {
    <K extends keyof D>(key:K):[D[K]]
    <K extends keyof D, K2 extends keyof D>(key:K, key2:K2):[D[K], D[K2]]
    <K extends keyof D, K2 extends keyof D, K3 extends keyof D>(key:K, key2:K2, key3:K3):[D[K], D[K2], D[K3]]
    <K extends keyof D, K2 extends keyof D, K3 extends keyof D, K4 extends keyof D>(key:K, key2:K2, key3:K3, key4:K4):[D[K], D[K2], D[K3], D[K4]]
}

export class Container<
    I extends ImportsRegistry = {},
    D extends DependenciesRegistry = {},
    AD extends AsyncDependenciesRegistry = {},
    C = {}> {
    private cache:{ [key:string]:any } = {};  //TODO: create cache class for managing cache

    constructor(
        private entries:ModuleEntries<I, D>,
        private context:C) {
    }

    get = <K extends keyof (D & AD)>(key:K):ModuleEntriesDependencies<D, AD>[K] => {
        return this.getChild(this.cache, key);
    };

    getMany:GetMany<D> = (...args:any[]) => {
        return args.map(this.get) as any;
    };

    toObject():MaterializedModuleEntries<I, D, AD> {
        return this.getProxiedAccessor();
    }

    deepGet<I1 extends ImportsRegistry, D2 extends DependenciesRegistry, AD2 extends AsyncDependenciesRegistry, K extends keyof MaterializedModuleEntries<I1, D2, AD2>>(module:Module<I1, D2>, key:K):MaterializedModuleEntries<I1, D2, AD2>[K] {
        let childModule:ModuleEntries | undefined = unwrapThunk(this.findModule(module.entries.moduleId.identity)); //TODO: it should be compared using id - because identity doesn't give any guarantee that given dependency is already registered

        if (!childModule) {
            console.warn('deepGet called with module which is not imported by any descendant module');
            childModule = module.entries;
        }

        if (this.cache[childModule.moduleId.id]) {
            return this.cache[childModule.moduleId.id].getChild(this.cache, key);
        } else {
            let childMaterializedModule:any = new Container(childModule, this.context);
            this.cache[childModule.moduleId.id] = childMaterializedModule;
            return childMaterializedModule.getChild(this.cache, key); //TODO: we have to pass cache !!!!
        }
    }

    initAsyncDependencies() {

    }

    private findModule(moduleIdentity):ModuleEntries | undefined {
        let found = Object.values(this.entries.imports).map(unwrapThunk).find(m => m.moduleId.identity === moduleIdentity);
        if (found) {
            return found;
        }

        for (let importKey in this.entries.imports) {
            const targetContainer = new Container(unwrapThunk(this.entries.imports[importKey]), this.context as any);
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
        if (this.entries.declarations[localKey]) {
            let declarationResolver:DependencyResolver = this.entries.declarations[localKey];

            if (cache[declarationResolver.id]) {
                return cache[declarationResolver.id]
            } else {
                let instance = declarationResolver.get(this.getProxiedAccessor(cache), this.context);
                cache[declarationResolver.id] = instance;
                return instance;
            }
        }

        if (this.entries.imports[localKey]) {
            let childModule = unwrapThunk(this.entries.imports[localKey]);
            if (cache[childModule.moduleId.id]) {
                return cache[childModule.moduleId.id].getProxiedAccessor(cache)
            } else {
                let childMaterializedModule:any = new Container(childModule, this.context);
                cache[childModule.moduleId.id] = childMaterializedModule;
                return childMaterializedModule.getProxiedAccessor(cache); //TODO: we have to pass cache !!!!
            }
        }
    }
}