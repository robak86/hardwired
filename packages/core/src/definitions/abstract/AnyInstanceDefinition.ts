import { InstanceDefinition } from './InstanceDefinition';
import { AsyncInstanceDefinition } from './AsyncInstanceDefinition';

export type AnyInstanceDefinition<T, TExternals = []> =
  | InstanceDefinition<T, TExternals>
  | AsyncInstanceDefinition<T, TExternals>;
