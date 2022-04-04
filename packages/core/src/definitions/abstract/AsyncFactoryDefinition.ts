import { LifeTime } from './LifeTime';
import { AnyInstanceDefinition } from './AnyInstanceDefinition';

// prettier-ignore
export type AsyncFactoryDefinition<TValue, TLifeTime extends LifeTime, TExternalParams extends any[]> =
  | AnyInstanceDefinition<TValue, LifeTime.singleton, []>
  | AnyInstanceDefinition<TValue, LifeTime.transient, TExternalParams>
  | AnyInstanceDefinition<TValue, LifeTime.request, TExternalParams>
  | AnyInstanceDefinition<TValue, LifeTime.scoped, TExternalParams>
