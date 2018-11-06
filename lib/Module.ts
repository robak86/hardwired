import {Omit} from "./utils/types";
import {Thunk} from "./utils/thunk";
import {ImmutableMap} from "./immutable-map";
import {ModuleId} from "./module-id";
import {DependencyResolver} from "./DependencyResolver";


export type MaterializedModule<D, M extends ImportsRegistry> = D & {
    [K in keyof M]:MaterializedModule<ModuleDeclarations<M[K]>, {}>;
}

export type ModuleDeclarations<M> = M extends Module<infer D, any> ? D : never;
export type ModuleImports<M> = M extends Module<any, any, infer M> ? M : never;
export type ModuleAsyncDeclarations<M> = M extends Module<any, infer AD> ? AD : never; //TODO Unwrap promise
export type ModuleContext<M> = M extends Module<any, any, any, infer CTX> ? CTX : never;

export type ImportsRegistry = Record<string, Module<any, any>>
export type DependenciesRegistry = Record<string, any>;
export type AsyncDependenciesRegistry = Record<string, () => Promise<any>>;


export type NotDuplicated<K, OBJ, RETURN> = Extract<keyof OBJ, K> extends never ? RETURN : never;


//TODO: .defineAsync should return AsyncModule! (container(...) should accept only Module asyncContainer(...) should accept AsyncModule)
//TODO: .import() should return AsyncModule if imported module is async

export class Module<D extends DependenciesRegistry = {},
    AD extends AsyncDependenciesRegistry = {},
    M extends ImportsRegistry = {}, C = {}> {


    constructor(public moduleId:ModuleId,
                private imports:ImmutableMap<Module, M> = new ImmutableMap<Module, M>('imports'),
                private declarations:ImmutableMap<any, D> = new ImmutableMap<any, D>('declarations')
    ) {}


    //MODULE should not expose such methods. It only should expose .getDefinitions() methods which returns raw map of imports and declarations
    // hasAsyncDeclarations():boolean {
    //     return Object.keys(this.asyncDeclarations).length > 0;
    // }

    hasModule(key:keyof M):boolean {
        return this.imports.hasKey(key);
    }

    isDeclared(key:keyof D):boolean {
        return this.declarations.hasKey(key);
    }

    //TODO: typescript doesn't interfere properly context type!!! try with conditional type (like ModuleImports, ModuleDeclarations)
    define<K extends string, V, C1>(key:K, factory:(container:MaterializedModule<D, M>, C1) => V):NotDuplicated<K, D, Module<D & Record<K, V>, AD, M, C & C1>> {
        let cloned = new Module(
            this.moduleId.withNextId(),
            this.imports,
            this.declarations.set(key, new DependencyResolver<any, any, any>(factory))
        );
        return cloned as any;
    }


    //TODO: make sure that inject replaces all module occurrences - given module can be imported many times - write specs
    inject<D1, AD1 extends AsyncDependenciesRegistry, M1 extends ImportsRegistry, C1>(otherModule:Module<D1, AD1, M1, C1>):Module<D, AD, M, C> {
        const imports = this.imports.mapValues((module) => {
            return module.moduleId.identity === otherModule.moduleId.identity ? //todo implement isEqual
                otherModule :
                module.inject(otherModule)
        });

        return new Module<D, AD, M, C>(
            this.moduleId.withNextId(),
            imports,
            this.declarations
        )
    }

    replace<K extends keyof D, C>(key:K, factory:(container:MaterializedModule<D, M>, C) => D[K]):Module<D, AD, M, C> {
        return this.undeclare(key).define(key as any, factory) as any;
    }


    //TODO: should be private. because it breaks typesafety when module is nested? ()
    undeclare<K extends keyof D>(key:K):Module<Omit<D, K>, AD, M, C> {
        return new Module(
            this.moduleId.withNextId(),
            this.imports,
            this.declarations.unset(key)
        );
    }

    import<K extends string, M1 extends Module>(key:K, mod2:Thunk<M1>):NotDuplicated<K, M, Module<D, AD, M & Record<K, Thunk<M1>>>> {
        return new Module(
            this.moduleId.withNextId(),
            this.imports.set(key, mod2),
            this.declarations
        ) as any;
    }
}