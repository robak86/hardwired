import { InstanceDefinition } from './InstanceDefinition';
import { AsyncInstanceDefinition } from './AsyncInstanceDefinition';

export type AnyInstanceDefinition<T, TMeta = never, TExternal = never> =
  | InstanceDefinition<T, TMeta, TExternal>
  | AsyncInstanceDefinition<T, TMeta, TExternal>;
