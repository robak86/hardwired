import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../utils/async.js';

// prettier-ignore
export type FinalizerOrVoid<TInstance, TLifeTime extends LifeTime> =
  TLifeTime extends LifeTime.singleton ? IDisposeFinalizer<TInstance, TLifeTime> :
  TLifeTime extends LifeTime.cascading ? IDisposeFinalizer<TInstance, TLifeTime> :
  TLifeTime extends LifeTime.scoped ? IDisposeFinalizer<TInstance, TLifeTime> :
  TLifeTime extends LifeTime.transient ? undefined :
    never;

export interface IDisposeFinalizer<TInstance, TLifetime extends LifeTime> {
  onDispose(disposeFn: (instance: TInstance) => MaybePromise<void>): void;
}
