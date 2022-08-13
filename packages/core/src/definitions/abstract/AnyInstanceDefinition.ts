import { InstanceDefinition } from './sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from './async/AsyncInstanceDefinition.js';
import { LifeTime } from './LifeTime.js';

export type AnyInstanceDefinition<T, TLifeTime extends LifeTime> =
  | InstanceDefinition<T, TLifeTime>
  | AsyncInstanceDefinition<T, TLifeTime>;
