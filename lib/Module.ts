import {Omit} from "./utils/types";
import {Thunk, unwrapThunk} from "./utils/thunk";
import {
    AsyncDependenciesRegistry,
    DependenciesRegistry,
    ImportsRegistry,
    MaterializedModuleEntries,
    ModuleEntries
} from "./module-entries";
import {Container} from "./Container";


export type ModuleContext<M> = M extends Module<any, any, any, infer CTX> ? CTX : never;


export type NotDuplicated<K, OBJ, RETURN> = Extract<keyof OBJ, K> extends never ? RETURN : never;


//TODO: .defineAsync should return AsyncModule! (container(...) should accept only Module asyncContainer(...) should accept AsyncModule)
//TODO: .import() should return AsyncModule if imported module is async

type ModuleWithDefinition<K extends string, V, C1, I extends ImportsRegistry, D extends DependenciesRegistry, AD extends AsyncDependenciesRegistry, C> =
    NotDuplicated<K, D, Module<I, D & Record<K, V>, AD, C & C1>>

type ModuleWithAsyncDefinition<K extends string, V, C1, I extends ImportsRegistry, D extends DependenciesRegistry, AD extends AsyncDependenciesRegistry, C> =
    NotDuplicated<K, D, Module<I, D, AD & Record<K, V>, C & C1>>

type ModuleWithImport<K extends string, I1 extends ImportsRegistry, D1 extends DependenciesRegistry, AD1 extends AsyncDependenciesRegistry, I extends ImportsRegistry, D extends DependenciesRegistry, AD extends AsyncDependenciesRegistry, C> =
    NotDuplicated<K, I, Module<I & Record<K, Thunk<ModuleEntries<I1, D1, AD1>>>, D, AD, C>>

type DefineAsyncContext<I extends ImportsRegistry, D extends DependenciesRegistry, AD extends AsyncDependenciesRegistry> = MaterializedModuleEntries<I, D, AD>

export class Module<I extends ImportsRegistry = {},
    D extends DependenciesRegistry = {},
    AD extends AsyncDependenciesRegistry = {},
    C = {}> {


    constructor(public entries:ModuleEntries<I, D>) {}


    hasModule(key:keyof I):boolean {
        return ModuleEntries.hasModule(key, this.entries);
    }

    isDeclared(key:keyof D):boolean {
        return ModuleEntries.hasDefinition(key, this.entries);
    }

    define<K extends string, V, C1>(key:K, factory:(container:MaterializedModuleEntries<I, D, AD>, C1) => V):ModuleWithDefinition<K, V, C1, I, D, AD, C> {
        let cloned = new Module(ModuleEntries.define(key, factory)(this.entries));
        return cloned as any;
    }

    defineAsync<K extends string, V, C1>(key:K, factory:(ctx:DefineAsyncContext<I, D, AD>) => Promise<V>):ModuleWithAsyncDefinition<K, V, C1, I, D, AD, C> {
        let cloned = new Module(ModuleEntries.defineAsync(key, factory)(this.entries));
        return cloned as any;
    }

    //TODO: make sure that inject replaces all module occurrences - given module can be imported many times - write specs
    inject<D1, AD1 extends AsyncDependenciesRegistry, I1 extends ImportsRegistry, C1>(otherModule:Module<I1, D1, AD1, C1>):Module<I, D, AD, C> {
        return new Module(ModuleEntries.inject(otherModule.entries, this.entries));
    }

    replace<K extends keyof D, C>(key:K, factory:(container:MaterializedModuleEntries<I, D, AD>, C) => D[K]):Module<I, D, AD, C> {
        return this.undeclare(key).define(key as any, factory) as any;
    }


    //TODO: should be private. because it breaks typesafety when module is nested? ()
    undeclare<K extends keyof D>(key:K):Module<I, Omit<D, K>, AD, C> {
        return new Module(ModuleEntries.undefine(key, this.entries));
    }

    getEntries = () => {
        return this.entries;
    };

    import<K extends string, I1 extends ImportsRegistry, D1 extends DependenciesRegistry, AD1 extends AsyncDependenciesRegistry>(key:K, mod2:Thunk<Module<I1, D1, AD1>>):ModuleWithImport<K, I1, D1, AD1, I, D, AD, C> {
        const getEntries = () => unwrapThunk(mod2).getEntries();
        return new Module(ModuleEntries.import(key, getEntries)(this.entries)) as any
    }

    buildContainer(ctx:C):Container<I, D, AD> {
        return new Container(this.entries, ctx);
    }

    async buildAsyncContainer(ctx:C):Promise<Container<I, D, AD, C>> {
        return new Container(this.entries, ctx);
    }
}