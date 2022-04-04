import { LifeTime } from './LifeTime';
import { InstanceDefinition } from './base/InstanceDefinition';

// prettier-ignore
export type FactoryDefinition<TValue, TLifeTime extends LifeTime, TExternalParams extends any[]> =
  | InstanceDefinition<TValue, LifeTime.singleton, []>
  | InstanceDefinition<TValue, LifeTime.transient, TExternalParams>
  | InstanceDefinition<TValue, LifeTime.request, TExternalParams>
  | InstanceDefinition<TValue, LifeTime.scoped, TExternalParams>
