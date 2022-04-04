import { LifeTime } from './LifeTime';
import { InstanceDefinition } from './base/InstanceDefinition';

// prettier-ignore
export type InstanceDefinitionDependency<TValue, TLifeTime extends LifeTime> =
    TLifeTime extends LifeTime.singleton ?
        | InstanceDefinition<TValue, LifeTime.singleton, []>
        | InstanceDefinition<TValue, LifeTime.scoped, []>
        | InstanceDefinition<TValue, LifeTime.transient, any>
        | InstanceDefinition<TValue, LifeTime.request, any> :
    TLifeTime extends LifeTime.transient ?
        | InstanceDefinition<TValue, LifeTime.singleton, []>
        | InstanceDefinition<TValue, LifeTime.scoped, []>
        | InstanceDefinition<TValue, LifeTime.transient, any>
        | InstanceDefinition<TValue, LifeTime.request, any>:
    TLifeTime extends LifeTime.request ?
        | InstanceDefinition<TValue, LifeTime.singleton, []>
        | InstanceDefinition<TValue, LifeTime.scoped, []>
        | InstanceDefinition<TValue, LifeTime.request, any>
        | InstanceDefinition<TValue, LifeTime.transient, any>:
    TLifeTime extends LifeTime.scoped ?
        | InstanceDefinition<TValue, LifeTime.singleton, []>
        | InstanceDefinition<TValue, LifeTime.scoped, []>
        | InstanceDefinition<TValue, LifeTime.request, any>
        | InstanceDefinition<TValue, LifeTime.transient, any>:
        never
