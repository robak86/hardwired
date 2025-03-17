import type { Definition } from '../impl/Definition.js';
import type { LifeTime } from '../abstract/LifeTime.js';

export type Deferred<T extends Definition<any, LifeTime.transient, any>> =
  T extends Definition<infer TInstance, LifeTime.transient, infer TArgs> ? (...args: TArgs) => TInstance : never;
