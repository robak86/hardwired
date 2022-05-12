import { InstanceDefinition } from './sync/InstanceDefinition';
import { AsyncInstanceDefinition } from './async/AsyncInstanceDefinition';
import { LifeTime } from './LifeTime';
import { ExternalsRecord } from "./base/BaseDefinition";

export type AnyInstanceDefinition<T, TLifeTime extends LifeTime, TExternals> =
  | InstanceDefinition<T, TLifeTime, TExternals>
  | AsyncInstanceDefinition<T, TLifeTime, TExternals>;
