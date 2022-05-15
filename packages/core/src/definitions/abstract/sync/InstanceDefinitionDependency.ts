import { LifeTime } from '../LifeTime.js';
import { InstanceDefinition } from './InstanceDefinition.js';

export type InstanceDefinitionDependency<TValue> =
  | InstanceDefinition<TValue, LifeTime.singleton, never>
  | InstanceDefinition<TValue, LifeTime.scoped, never>
  | InstanceDefinition<TValue, LifeTime.request, any>
  | InstanceDefinition<TValue, LifeTime.transient, any>;
