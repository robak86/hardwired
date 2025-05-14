import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';

export type Deferred<T extends IDefinition<any, LifeTime.transient, any>> =
  T extends IDefinition<infer TInstance, LifeTime.transient, infer TArgs> ? (...args: TArgs) => TInstance : never;
