import { LifeTime } from '../LifeTime';
import { InstanceDefinition } from './InstanceDefinition';

export type InstanceDefinitionDependency<TValue> =
  | InstanceDefinition<TValue, LifeTime.singleton, never>
  | InstanceDefinition<TValue, LifeTime.scoped, never>
  | InstanceDefinition<TValue, LifeTime.request, any>
  | InstanceDefinition<TValue, LifeTime.transient, any>
