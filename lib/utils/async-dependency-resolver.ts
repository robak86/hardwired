import {
    AsyncFactoryFunction,
    DependenciesRegistry,
    ImportsRegistry
} from "../module-entries";
import {nextId} from "./fastId";


export type AsyncDependencyDefinition<I extends ImportsRegistry = any, D extends DependenciesRegistry = any> = {
    id:string;
    resolver:AsyncFactoryFunction<I, D, {}>
}

export const AsyncDependencyDefinition = {
    build<I extends ImportsRegistry, D extends DependenciesRegistry>(resolver:AsyncFactoryFunction<I, D, {}>):AsyncDependencyDefinition<I, D> {
        return {
            id: nextId(),
            resolver
        }
    }
};