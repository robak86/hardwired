import {assoc, dissoc, shallowClone} from "./utils/shallowClone";
import {Thunk, UnwrapThunk, unwrapThunk} from "./utils/thunk";
import {Omit, UnwrapPromise} from "./utils/types";
import {mapValues} from 'lodash';
import {ModuleId} from "./module-id";
import {AsyncDependencyDefinition} from "./utils/async-dependency-resolver";
import {DependencyResolver} from "./DependencyResolver";


export type FactoryFunction<I extends ImportsRegistry = any, D extends DependenciesRegistry = any, AD extends AsyncDependenciesRegistry = any> =
    (ctx:MaterializedModuleEntries<I, D, AD>) => any

export type AsyncFactoryFunction<I extends ImportsRegistry = any, D extends DependenciesRegistry = any, AD extends AsyncDependenciesRegistry = any> =
    (ctx:MaterializedModuleEntries<I, D, AD>) => Promise<any>


type DeclarationsFactories<D> = {
    [K in keyof D]:DependencyResolver<any, any, D>
}

type AsyncDeclarationsFactories<I extends ImportsRegistry, D extends DependenciesRegistry> = {
    [K in keyof I]:AsyncDependencyDefinition<I, D>
}

export type ImportsRegistry = Record<string, Thunk<ModuleEntries<any, any>>>
export type DependenciesRegistry = Record<string, any>;
export type AsyncDependenciesRegistry = Record<string, () => Promise<any>>;

export type MaterializeAsyncDependencies<AD extends AsyncDependenciesRegistry> = {
    [K in keyof AD]:UnwrapPromise<ReturnType<AD[K]>>
}

// type WTF = MaterializeAsyncDependencies<{a: () => Promise<boolean>}>;


export type ModuleEntriesDependencies<D extends DependenciesRegistry, AD extends AsyncDependenciesRegistry> =
    D
    & MaterializeAsyncDependencies<AD>;

export type MaterializedModuleEntries<I extends ImportsRegistry, D extends DependenciesRegistry, AD extends AsyncDependenciesRegistry> =
    MaterializeAsyncDependencies<AD> & D & {
    [K in keyof I]:MaterializedModuleEntries<{}, {}, ExtractModuleRegistryDeclarations<UnwrapThunk<I[K]>>>;
}

export type ExtractModuleRegistryDeclarations<M extends ModuleEntries> = M extends ModuleEntries<any, infer D, infer AD> ? ModuleEntriesDependencies<D,AD> : never;


export type ModuleEntries<I extends ImportsRegistry = any, D extends DependenciesRegistry = any, AD extends AsyncDependenciesRegistry = any> = {
    moduleId:ModuleId,
    imports:I,
    declarations:DeclarationsFactories<D>,
    asyncDeclarations:AsyncDeclarationsFactories<I, D>,
}
export const ModuleEntries = {
    build(name:string):ModuleEntries {
        return {
            moduleId: ModuleId.build(name),
            imports: {},
            declarations: {},
            asyncDeclarations: {}
        }
    },

    hasModule(key:string, entries:ModuleEntries):boolean {
        return !!entries.imports[key];
    },

    hasDefinition(key:string, entries:ModuleEntries):boolean {
        return !!entries.declarations[key];
    },

    hasOwnAsyncDefinition(entries:ModuleEntries):boolean {
        return Object.keys(entries.asyncDeclarations).length > 0;
    },

    hasAsyncDefinitions(entries:ModuleEntries):boolean {
        return ModuleEntries.hasAsyncDefinitions(entries) ||
            Object.values(entries.imports).some((moduleEntries:Thunk<ModuleEntries>) => ModuleEntries.hasAsyncDefinitions(unwrapThunk(moduleEntries)))
    },

    //TODO: use assoc, assoc path or something
    define<K extends string, I extends ImportsRegistry, D extends DependenciesRegistry, AD extends AsyncDependenciesRegistry, O>
    (key:K, factory:(container:MaterializedModuleEntries<I, D, AD>, C1) => O) {
        return (module:ModuleEntries<I, D>):ModuleEntries<I, D & Record<K, O>, AD> => {
            return {
                moduleId: ModuleId.next(module.moduleId),
                imports: shallowClone(module.imports),
                declarations: assoc(key, new DependencyResolver(factory), module.declarations),
                asyncDeclarations: shallowClone(module.asyncDeclarations),
            }
        }
    },

    defineAsync<K extends string,
        I extends ImportsRegistry,
        D extends DependenciesRegistry,
        AD extends AsyncDependenciesRegistry,
        O extends AsyncFactoryFunction<I, D, AD>>
    (key:K, factory:O) {
        return (module:ModuleEntries<I, D>):ModuleEntries<I, D, AD & Record<K, O>> => {
            return {
                moduleId: ModuleId.next(module.moduleId),
                imports: shallowClone(module.imports),
                declarations: shallowClone(module.declarations),
                asyncDeclarations: assoc(key, AsyncDependencyDefinition.build(factory), module.asyncDeclarations),
            }
        }
    },

    inject(otherModule:ModuleEntries, entries:ModuleEntries):ModuleEntries {
        return {
            moduleId: ModuleId.next(entries.moduleId),
            declarations: shallowClone(entries.declarations),
            imports: mapValues(entries.imports, (module) => {
                return unwrapThunk(module).moduleId.identity === unwrapThunk(otherModule).moduleId.identity ? //todo implement isEqual
                    otherModule :
                    ModuleEntries.inject(otherModule, unwrapThunk(module))
            }),
            asyncDeclarations: shallowClone(entries.asyncDeclarations)
        };
    },

    undefine<I extends ImportsRegistry, D extends DependenciesRegistry, K extends keyof D>(key:K, entries:ModuleEntries<I, D>):ModuleEntries<I, Omit<D, K>> {
        return {
            moduleId: ModuleId.next(entries.moduleId),
            imports: shallowClone(entries.imports),
            declarations: dissoc(key, entries.declarations),
            asyncDeclarations: shallowClone(entries.asyncDeclarations)
        }
    },

    import<K extends string, I extends ImportsRegistry, D extends DependenciesRegistry, AD extends AsyncDependenciesRegistry, M2 extends ModuleEntries>(key:K, otherModule:Thunk<M2>) {
        return (module:ModuleEntries<I, D>):ModuleEntries<I & Record<K, Thunk<M2>>, D, AD> => {
            return {
                moduleId: ModuleId.next(module.moduleId),
                imports: assoc(key, otherModule, module.imports),
                declarations: shallowClone(module.declarations),
                asyncDeclarations: shallowClone(module.asyncDeclarations)
            }
        }
    }
};