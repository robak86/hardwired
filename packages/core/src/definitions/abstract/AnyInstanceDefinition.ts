import { InstanceDefinition } from './sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from './async/AsyncInstanceDefinition.js';
import { LifeTime } from './LifeTime.js';
import { BaseDefinition, BoundDefinition } from './FnDefinition.js';

export type AnyInstanceDefinition<T, TLifeTime extends LifeTime, TMeta> =
  | InstanceDefinition<T, TLifeTime, TMeta>
  | AsyncInstanceDefinition<T, TLifeTime, TMeta>
  | BaseDefinition<T, TLifeTime, TMeta>;
