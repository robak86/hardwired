import { LifeTime } from './LifeTime';
import { AnyInstanceDefinition } from './AnyInstanceDefinition';

// prettier-ignore
export type InstanceDefinitionDependency<TValue, TLifeTime extends LifeTime> =
    TLifeTime extends LifeTime.singleton ?
        | AnyInstanceDefinition<TValue, LifeTime.singleton, any>
        | AnyInstanceDefinition<TValue, LifeTime.transient, any>
        | AnyInstanceDefinition<TValue, LifeTime.request, any> :
    TLifeTime extends LifeTime.transient ?
        | AnyInstanceDefinition<TValue, LifeTime.singleton, []>
        | AnyInstanceDefinition<TValue, LifeTime.transient, any>
        | AnyInstanceDefinition<TValue, LifeTime.request, any> :
    TLifeTime extends LifeTime.request ?
        | AnyInstanceDefinition<TValue, LifeTime.singleton, []>
        | AnyInstanceDefinition<TValue, LifeTime.request, any>
        | AnyInstanceDefinition<TValue, LifeTime.transient, any>:
    TLifeTime extends LifeTime.scoped ?
        | AnyInstanceDefinition<TValue, LifeTime.singleton, []>
        | AnyInstanceDefinition<TValue, LifeTime.request, any>
        | AnyInstanceDefinition<TValue, LifeTime.transient, any>:
        never
