import {DependencyResolver} from "./DependencyResolver";
import {Module} from "./Module";
import {Thunk, unwrapThunk} from "./utils/thunk";
import {
    AsyncDependenciesRegistry,
    DependenciesRegistry,
    ImportsRegistry,
    MaterializedModuleEntries,
    ModuleEntries,
    ModuleEntriesDependencies
} from "./module-entries";
import {AsyncDependencyDefinition} from "./utils/async-dependency-resolver";
import {containerProxyAccessor} from "./container-proxy-accessor";
import {ContainerCache} from "./container-cache";


interface GetMany<D> {
    <K extends keyof D>(key:K):[D[K]]
    <K extends keyof D, K2 extends keyof D>(key:K, key2:K2):[D[K], D[K2]]
    <K extends keyof D, K2 extends keyof D, K3 extends keyof D>(key:K, key2:K2, key3:K3):[D[K], D[K2], D[K3]]
    <K extends keyof D, K2 extends keyof D, K3 extends keyof D, K4 extends keyof D>(key:K, key2:K2, key3:K3, key4:K4):[D[K], D[K2], D[K3], D[K4]]
}


export class Container<I extends ImportsRegistry = {},
    D extends DependenciesRegistry = {},
    AD extends AsyncDependenciesRegistry = {},
    C = {}> {
    private cache:ContainerCache = new ContainerCache();
    private asyncDependenciesInitialized:boolean = false;

    constructor(
        private entries:ModuleEntries<I, D>,
        private context:C) {
    }

    get = <K extends keyof (D & AD)>(key:K):ModuleEntriesDependencies<D, AD>[K] => {
        //if is async container check if asyncDependenciesInitialized is true. if not throw an error
        return this.getChild(this.cache.forNewRequest(), key); //
    };

    getMany:GetMany<D> = (...args:any[]) => {
        const cache = this.cache.forNewRequest();

        return args.map(dep => {
            return this.getChild(cache, dep);
        }) as any;
    };

    asObject():MaterializedModuleEntries<I, D, AD> {
        return containerProxyAccessor(this, this.cache.forNewRequest());
    }

    checkout(inherit:boolean):Container<I, D, AD> {
        if (inherit) {
            return new Container(this.entries, {...this.cache});
        } else {
            return new Container(this.entries, {});
        }
    }

    deepGet<I1 extends ImportsRegistry, D2 extends DependenciesRegistry, AD2 extends AsyncDependenciesRegistry, K extends keyof MaterializedModuleEntries<I1, D2, AD2>>(module:Module<I1, D2>, key:K):MaterializedModuleEntries<I1, D2, AD2>[K] {
        let childModule:ModuleEntries | undefined = unwrapThunk(this.findModule(module.entries.moduleId.identity)); //TODO: it should be compared using id - because identity doesn't give any guarantee that given dependency is already registered

        if (!childModule) {
            console.warn('deepGet called with module which is not imported by any descendant module');
            childModule = module.entries;
        }

        //TODO: investigate if we should cache containers. If so we need import resolver, but since containers are almost stateless maybe caching is not mandatory ?!
        // if (this.cache[childModule.moduleId.id]) {
        //     return this.cache[childModule.moduleId.id].getChild(this.cache, key);
        // } else {
            let childMaterializedModule:any = new Container(childModule, this.context);
            // this.cache[childModule.moduleId.id] = childMaterializedModule;
            return childMaterializedModule.getChild(this.cache, key); //TODO: we have to pass cache !!!!
        // }
    }

    async initAsyncDependencies(cache = this.cache) {
        await Promise.all(Object
            .values(this.entries.imports)
            .map((e:Thunk<ModuleEntries>) => new Container(unwrapThunk(e), cache))
            .map(c => c.initAsyncDependencies(cache)));


        let keys = Object.keys(this.entries.asyncDeclarations);

        let resolved = await Promise.all(keys.map((key) => this.entries.asyncDeclarations[key].resolver(containerProxyAccessor(this, cache)).then((value) => ({
            id: this.entries.asyncDeclarations[key].id,
            key,
            value
        }))));

        resolved.forEach(r => cache.setForGlobalScope(r.id, r.value));

        this.asyncDependenciesInitialized = true;
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

    //TODO: extract to class


    protected getChild(cache, dependencyKey:string) {
        if (this.entries.declarations[dependencyKey]) {
            let declarationResolver:DependencyResolver = this.entries.declarations[dependencyKey];
            return declarationResolver.build(this, this.context, cache);
        }

        //TODO: asyncDeclarations should be wrapped in AsyncResolver - analogous to DependencyResolver
        if (this.entries.asyncDeclarations[dependencyKey]) {
            let asyncDefinition:AsyncDependencyDefinition = this.entries.asyncDeclarations[dependencyKey];

            if (cache.hasInGlobalScope(asyncDefinition.id)) {
                return cache.getFromGlobalScope(asyncDefinition.id)
            } else {
                throw new Error(`
                Cannot get ${dependencyKey} from ${this.entries.moduleId.name}. 
                Getting async dependencies is only allowed by using asyncContainer.
                If asyncContainer was used it means that circular between two async definition exists
                `);
            }
        }

        if (this.entries.imports[dependencyKey]) {
            let childModule = unwrapThunk(this.entries.imports[dependencyKey]);


            //TODO: investigate if we should cache containers
            // if (cache[childModule.moduleId.id]) {
            //     return containerProxyAccessor(cache[childModule.moduleId.id], cache);
            // } else {
                let childMaterializedModule:any = new Container(childModule, this.context);
                // cache[childModule.moduleId.id] = childMaterializedModule;
                return containerProxyAccessor(childMaterializedModule, cache); //TODO: we have to pass cache !!!!
            // }
        }

        throw new Error(`Cannot find dependency for ${dependencyKey} key`)
    }
}