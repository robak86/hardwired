import { InstanceDefinition } from './sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from './async/AsyncInstanceDefinition.js';
import { LifeTime } from './LifeTime.js';
import { ExternalsValuesRecord } from './base/BaseDefinition.js';

export type AnyInstanceDefinition<T, TLifeTime extends LifeTime, TExternals> =
  | InstanceDefinition<T, TLifeTime, TExternals>
  | AsyncInstanceDefinition<T, TLifeTime, TExternals>;
