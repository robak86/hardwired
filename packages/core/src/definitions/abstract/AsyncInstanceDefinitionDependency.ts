import { LifeTime } from './LifeTime';
import { AnyInstanceDefinition } from './AnyInstanceDefinition';

export type AsyncInstanceDefinitionDependency<TValue> =
  | AnyInstanceDefinition<TValue, LifeTime.singleton, []>
  | AnyInstanceDefinition<TValue, LifeTime.scoped, []>
  | AnyInstanceDefinition<TValue, LifeTime.transient, any>
  | AnyInstanceDefinition<TValue, LifeTime.request, any>;
