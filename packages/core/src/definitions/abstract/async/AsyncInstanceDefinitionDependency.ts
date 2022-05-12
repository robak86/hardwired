import { LifeTime } from '../LifeTime';
import { AnyInstanceDefinition } from '../AnyInstanceDefinition';

export type AsyncInstanceDefinitionDependency<TValue> =
  | AnyInstanceDefinition<TValue, LifeTime.singleton, never>
  | AnyInstanceDefinition<TValue, LifeTime.scoped, never>
  | AnyInstanceDefinition<TValue, LifeTime.transient, any>
  | AnyInstanceDefinition<TValue, LifeTime.request, any>;
