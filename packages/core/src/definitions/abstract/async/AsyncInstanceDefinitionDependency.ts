import { LifeTime } from '../LifeTime.js';
import { AnyInstanceDefinition } from '../AnyInstanceDefinition.js';

export type AsyncInstanceDefinitionDependency<TValue> =
  | AnyInstanceDefinition<TValue, LifeTime.singleton, never>
  | AnyInstanceDefinition<TValue, LifeTime.scoped, never>
  | AnyInstanceDefinition<TValue, LifeTime.transient, any>
  | AnyInstanceDefinition<TValue, LifeTime.request, any>;
