import { InstanceDefinition } from './InstanceDefinition';
import { AsyncInstanceDefinition } from './AsyncInstanceDefinition';

export type AnyInstanceDefinition<T, TExternal = never> =
  | InstanceDefinition<T, TExternal>
  | AsyncInstanceDefinition<T, TExternal>;
