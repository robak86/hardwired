import {DependenciesRegistry, ImportsRegistry} from "./Module";
import {nextId} from "./utils/fastId";
import {assoc, shallowClone} from "./utils/shallowClone";


export type ModuleId = {
    name:string,
    id:string,
    identity:string
}

const ModuleId = {
    build(name:string) {
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


type DeclarationsFactories<D> = {
    [K in keyof D]:(module:Module) => D[K]
}

export type Module<I extends ImportsRegistry = any, D extends DependenciesRegistry = any> = {
    id:ModuleId,
    imports:I,
    declarations:DeclarationsFactories<D>
}

export const Module = {
    build(name:string) {
        return {
            id: ModuleId.build(name),
            imports: {},
            declarations: {}
        }
    },

    define<K extends string, I extends ImportsRegistry, D extends DependenciesRegistry, O>(key:K, factory:() => O) {
        return (module:Module<I, D>):Module<I, D & Record<K, O>> => {
            return {
                id: ModuleId.next(module.id),
                imports: shallowClone(module.imports),
                declarations: assoc(key, factory, module.declarations)
            }
        }
    },

    import<K extends string, I extends ImportsRegistry, D extends DependenciesRegistry, O, M2 extends Module>(key:K, otherModule:M2) {
        return (module:Module<I, D>):Module<I & Record<K, M2>, D> => {
            return {
                id: ModuleId.next(module.id),
                imports: assoc(key, otherModule, module.imports),
                declarations: shallowClone(module.declarations)
            }
        }
    }
};