import { InstanceDefinition } from './sync/InstanceDefinition';
import { AsyncInstanceDefinition } from './async/AsyncInstanceDefinition';
import { LifeTime } from './LifeTime';

export type AnyInstanceDefinition<T, TLifeTime extends LifeTime, TExternals extends any[] = []> =
  | InstanceDefinition<T, TLifeTime, TExternals>
  | AsyncInstanceDefinition<T, TLifeTime, TExternals>;
