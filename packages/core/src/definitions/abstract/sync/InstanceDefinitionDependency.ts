import { LifeTime } from '../LifeTime';
import { InstanceDefinition } from './InstanceDefinition';

export type InstanceDefinitionDependency<TValue> =
  | InstanceDefinition<TValue, LifeTime.singleton, []>
  | InstanceDefinition<TValue, LifeTime.scoped, []>
  | InstanceDefinition<TValue, LifeTime.request, any>
  | InstanceDefinition<TValue, LifeTime.transient, any>;
