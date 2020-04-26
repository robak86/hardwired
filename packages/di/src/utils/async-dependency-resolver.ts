import {
    AsyncDefinitionsRecord,
    AsyncFactoryFunction,
    DefinitionsRecord,
    ImportsRecord
} from "../module/module-entries";
import {nextId} from "./fastId";


export type AsyncDependencyDefinition<I extends ImportsRecord = any, D extends DefinitionsRecord = any, AD extends AsyncDefinitionsRecord = any> = {
    id:string;
    resolver:AsyncFactoryFunction<I, D, AD>
}

export const AsyncDependencyDefinition = {
    build<I extends ImportsRecord, D extends DefinitionsRecord, AD extends AsyncDefinitionsRecord, V>(resolver:AsyncFactoryFunction<I, D, AD>):AsyncDependencyDefinition<I, D, AD> {
        return {
            id: nextId(),
            resolver
        }
    }
};