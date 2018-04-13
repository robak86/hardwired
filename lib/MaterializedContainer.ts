import {PathFunction} from "./utils";
import {DependencyResolver, DependencyResolverFunction} from "./DependencyResolver";
import {MaterializedModule2, ModulesRegistry} from "./Module";

// const a:Exclude<"a", "b"> = {};

//
// function proxyAccessor() {
//     new Proxy({} as any, {
//         has(target, property):boolean {
//             return true;
//         },
//         get(target, property) {
//
//             let returned = self.get(property as any);
//
//             return returned;
//
//
//             // self.path.push(property as string);
//             // return self.pathSniffer;
//         }
//     })
// }

export type DependencyResolversRegistry<D> = {
    [K in keyof D]:DependencyResolverFunction<any, any, any>;
}

export class MaterializedContainer<D = {}, M extends ModulesRegistry = {}, C = {}> {

    private cache:{ [key:string]:any } = {};
    protected readonly proxiedGet;

    constructor(private declarationsResolvers:DependencyResolversRegistry<D>,
                private imports:M,
                private context:C,
                private cachedInstances) {

        const self = this;

        this.proxiedGet = new Proxy({} as any, {
            has(target, property):boolean {
                return true;
            },
            get(target, property) {

                let returned = self.get(property as any);

                return returned;


                // self.path.push(property as string);
                // return self.pathSniffer;
            }
        })
    }

    get:PathFunction<MaterializedModule2<D, M>> = (...args:any[]) => {
        return this.getWithCache(this.cache, args);
    };


    protected getWithCache(cache, path) {
        const first = path.shift();

        if (this.declarationsResolvers[first]) {
            let declarationResolver:DependencyResolver = this.declarationsResolvers[first];

            if (this.cache[declarationResolver.id]) {
                return cache[declarationResolver.id]
            } else {
                let instance = declarationResolver.get(this.proxiedGet, this.context);
                cache[declarationResolver.id] = instance;
                return instance;
            }
        }

        if (this.imports[first]) {
            let childModule = this.imports[first];
            if (cache[childModule.id]) {
                return cache[childModule.id].getWithCache(cache, path);
            } else {
                let childMaterializedModule:any = childModule.checkout(this.context);
                cache[childModule.id] = childMaterializedModule;
                return childMaterializedModule.proxiedGet; //TODO: we have to pass cache !!!!
            }


        }
    }


}