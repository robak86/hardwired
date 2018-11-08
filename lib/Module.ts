import {Omit} from "./utils/types";
import {Thunk} from "./utils/thunk";
import {ImmutableMap} from "./immutable-map";
import {ModuleId} from "./module-id";
import {DependencyResolver} from "./DependencyResolver";

export type MaterializedModule<D, M extends ImportsRegistry> = D & {
    [K in keyof M]:MaterializedModule<ModuleDeclarations<M[K]>, {}>;
}

export type ModuleDeclarations<M> = M extends Module<any, infer D> ? D : never;
export type ModuleImports<M> = M extends Module<infer M, any, any> ? M : never;
export type ModuleAsyncDeclarations<M> = M extends Module<any, any, infer AD> ? AD : never; //TODO Unwrap promise
export type ModuleContext<M> = M extends Module<any, any, any, infer CTX> ? CTX : never;

export type ImportsRegistry = Record<string, Module<any, any>>
export type DependenciesRegistry = Record<string, any>;
export type AsyncDependenciesRegistry = Record<string, () => Promise<any>>;


export type NotDuplicated<K, OBJ, RETURN> = Extract<keyof OBJ, K> extends never ? RETURN : never;

type Wtf = () => null;

//TODO: .defineAsync should return AsyncModule! (container(...) should accept only Module asyncContainer(...) should accept AsyncModule)
//TODO: .import() should return AsyncModule if imported module is async

type ModuleWithDefinition<K extends string, V, C1, I extends ImportsRegistry, D, AD extends AsyncDependenciesRegistry, C> =
    NotDuplicated<K, D, Module<I, D & Record<K, V>, AD, C & C1>>

type ModuleWithImport<K extends string, M1 extends Module, I extends ImportsRegistry, D, AD extends AsyncDependenciesRegistry, C> =
    NotDuplicated<K, I, Module<I & Record<K, Thunk<M1>>, D, AD, C>>

export class Module<I extends ImportsRegistry = {},
    D extends DependenciesRegistry = {},
    AD extends AsyncDependenciesRegistry = {},
    C = {}> {


    constructor(public moduleId:ModuleId,
                private imports:ImmutableMap<Module, I> = new ImmutableMap<Module, I>('imports'),
                private declarations:ImmutableMap<any, D> = new ImmutableMap<any, D>('declarations'),
                private asyncDeclarations:ImmutableMap<any, AD> = new ImmutableMap<any, AD>('declarations')
    ) {}


    //MODULE should not expose such methods. It only should expose .getDefinitions() methods which returns raw map of imports and declarations
    // hasAsyncDeclarations():boolean {
    //     return Object.keys(this.asyncDeclarations).length > 0;
    // }

    hasModule(key:keyof I):boolean {
        return this.imports.hasKey(key);
    }

    isDeclared(key:keyof D):boolean {
        return this.declarations.hasKey(key);
    }

    define<K extends string, V, C1>(key:K, factory:(container:MaterializedModule<D, I>, C1) => V):ModuleWithDefinition<K, V, C1, I, D, AD, C> {
        let cloned = new Module(
            this.moduleId.withNextId(),
            this.imports,
            this.declarations.set(key, new DependencyResolver<any, any, any>(factory)),
            this.asyncDeclarations
        );
        return cloned as any;
    }


    //TODO: make sure that inject replaces all module occurrences - given module can be imported many times - write specs
    inject<D1, AD1 extends AsyncDependenciesRegistry, I1 extends ImportsRegistry, C1>(otherModule:Module<I1, D1, AD1, C1>):Module<I, D, AD, C> {
        const imports = this.imports.mapValues((module) => {
            return module.moduleId.identity === otherModule.moduleId.identity ? //todo implement isEqual
                otherModule :
                module.inject(otherModule)
        });

        return new Module<I, D, AD, C>(
            this.moduleId.withNextId(),
            imports,
            this.declarations
        )
    }

    replace<K extends keyof D, C>(key:K, factory:(container:MaterializedModule<D, I>, C) => D[K]):Module<I, D, AD, C> {
        return this.undeclare(key).define(key as any, factory) as any;
    }


    //TODO: should be private. because it breaks typesafety when module is nested? ()
    undeclare<K extends keyof D>(key:K):Module<I, Omit<D, K>, AD, C> {
        return new Module(
            this.moduleId.withNextId(),
            this.imports,
            this.declarations.unset(key)
        );
    }

    import<K extends string, M1 extends Module>(key:K, mod2:Thunk<M1>):ModuleWithImport<K, M1, I, D, AD, C> {
        return new Module(
            this.moduleId.withNextId(),
            this.imports.set(key, mod2),
            this.declarations
        ) as any;
    }
}