import {
    AsyncDependenciesRegistry,
    AsyncFactoryFunction,
    DependenciesRegistry,
    ImportsRegistry
} from "../module-entries";
import {nextId} from "./fastId";


export type AsyncDependencyDefinition<I extends ImportsRegistry = any, D extends DependenciesRegistry = any, AD extends AsyncDependenciesRegistry = any> = {
    id:string;
    resolver:AsyncFactoryFunction<I, D, AD>
}

export const AsyncDependencyDefinition = {
    build<I extends ImportsRegistry, D extends DependenciesRegistry, AD extends AsyncDependenciesRegistry, V>(resolver:AsyncFactoryFunction<I, D, AD>):AsyncDependencyDefinition<I, D, AD> {
        return {
            id: nextId(),
            resolver
        }
    }
};