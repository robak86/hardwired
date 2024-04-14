import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { InstanceDefinitionDependency } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { AsyncInstanceDefinitionDependency } from '../definitions/abstract/async/AsyncInstanceDefinitionDependency.js';

// prettier-ignore
export type PartiallyApplied<A extends any[], D extends PartialArgs<A>, R> =
  A extends D ? () => R :
  A extends [...D, ...infer TRest] ? (...args:TRest) => R : // ...D may be replaced with SameLength<D>?
      never;

// prettier-ignore
export type PartialArgs<T extends any[]> =
  [] extends T ? []:
    T extends [...infer TPRev, any] ? (T | PartialArgs<TPRev>) : never;

// prettier-ignore
export type PartiallyAppliedFn<A extends any[], D extends PartialFnDependencies<A, any>, R> =
    [] extends A ? () => R :
    A extends D ? () => R :
    A extends [...SameLength<D>, ...infer TRest] ? (...args:TRest) => R :
    never;

// prettier-ignore
export type PartialFnDependencies<TArgs, TLifeTime extends LifeTime> =
    [] extends TArgs ? []:
    TArgs extends [...infer TPRev, any] ? ( {[K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K], TLifeTime>} ) | PartialFnDependencies<TPRev, TLifeTime> : [];

// prettier-ignore
export type AsyncPartialFnDependencies<TArgs extends any[], TLifeTime extends LifeTime> =
    [] extends TArgs ? []:
        TArgs extends [...infer TPRev, any] ? ( {[K in keyof TArgs]: AsyncInstanceDefinitionDependency<TArgs[K], TLifeTime>} ) | AsyncPartialFnDependencies<TPRev, TLifeTime> : [];

// prettier-ignore
export type PartiallyAppliedAsyncFn<A extends any[], D extends AsyncPartialFnDependencies<A, any>, R> =
    [] extends A ? () => R :
    A extends D ? () => R :
    A extends [...SameLength<D>, ...infer TRest] ? (...args:TRest) => R :
    never;

// type SameLength<T extends any[]> = { [K in keyof T]: any };
type SameLength<T extends any[]> = T extends [infer First, ...infer Rest] ? [any, ...SameLength<Rest>] : [];
