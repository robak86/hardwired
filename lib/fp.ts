import {DependenciesRegistry, ImportsRegistry, MaterializedModule} from "./Module";
import {nextId} from "./utils/fastId";
import {assoc, dissoc, shallowClone} from "./utils/shallowClone";
import {Thunk, unwrapThunk} from "./utils/thunk";
import {Omit} from "./utils/types";
import {mapValues} from 'lodash';
import {DependencyResolver} from "./DependencyResolver";


export type ModuleId = {
    name:string,
    id:string,
    identity:string
}

const ModuleId = {
    build(name:string):ModuleId {
        return {
            name,
            id: nextId(),
            identity: `module_${nextId()}`
        }
    },
    next(m:ModuleId):ModuleId {
        return {
            name: m.name,
            id: nextId(),
            identity: `module_${nextId()}`
        }
    }
};


// type ModuleImportsRegistry = Record<string, ModuleEntries>;

type DeclarationsFactories<D> = {
    [K in keyof D]:DependencyResolver<any, any, D>
}

export type ModuleEntries<I extends ImportsRegistry = any, D extends DependenciesRegistry = any> = {
    moduleId:ModuleId,
    imports:I,
    declarations:DeclarationsFactories<D>
}

export const ModuleEntries = {
    build(name:string):ModuleEntries {
        return {
            moduleId: ModuleId.build(name),
            imports: {},
            declarations: {}
        }
    },

    hasModule(key:string, entries:ModuleEntries):boolean {
        return !!entries.imports[key];
    },

    hasDefinition(key:string, entries:ModuleEntries):boolean {
        return !!entries.declarations[key];
    },

    define<K extends string, I extends ImportsRegistry, D extends DependenciesRegistry, O>(key:K, factory:(container:MaterializedModule<D, I>, C1) => O) {
        return (module:ModuleEntries<I, D>):ModuleEntries<I, D & Record<K, O>> => {
            return {
                moduleId: ModuleId.next(module.moduleId),
                imports: shallowClone(module.imports),
                declarations: assoc(key, new DependencyResolver(factory), module.declarations)
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
            })
        };
    },

    undefine<I extends ImportsRegistry, D extends DependenciesRegistry, K extends keyof D>(key:K, entries:ModuleEntries<I, D>):ModuleEntries<I, Omit<D, K>> {
        return {
            moduleId: ModuleId.next(entries.moduleId),
            imports: shallowClone(entries.imports),
            declarations: dissoc(key, entries.declarations)
        }
    },

    import<K extends string, I extends ImportsRegistry, D extends DependenciesRegistry, O, M2 extends ModuleEntries>(key:K, otherModule:Thunk<M2>) {
        return (module:ModuleEntries<I, D>):ModuleEntries<I & Record<K, Thunk<M2>>, D> => {
            return {
                moduleId: ModuleId.next(module.moduleId),
                imports: assoc(key, otherModule, module.imports),
                declarations: shallowClone(module.declarations)
            }
        }
    }
};