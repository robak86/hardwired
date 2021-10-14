import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { AnyInstanceDefinition } from "../definitions/abstract/AnyInstanceDefinition";

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
export type PartiallyAppliedDefinition<A extends any[], D extends PartialInstancesDefinitionsArgs<A>, R> =
    [] extends A ? () => R :
    A extends D ? () => R :
    A extends [...SameLength<D>, ...infer TRest] ? (...args:TRest) => R : // ...D may be replaced with SameLength<D>?
    never;

type SameLength<T extends any[]> = { [K in keyof T]: any };

// prettier-ignore
export type PartialInstancesDefinitionsArgs<TArgs extends any[]> =
    [] extends TArgs ? []:
    TArgs extends [...infer TPRev, any] ? ( {[K in keyof TArgs]: InstanceDefinition<TArgs[K], any>} ) | PartialInstancesDefinitionsArgs<TPRev> : never;


// prettier-ignore
export type PartialAnyInstancesDefinitionsArgs<TArgs extends any[]> =
    [] extends TArgs ? []:
        TArgs extends [...infer TPRev, any] ? ( {[K in keyof TArgs]: AnyInstanceDefinition<TArgs[K], any>} ) | PartialAnyInstancesDefinitionsArgs<TPRev> : never;


// prettier-ignore
export type PartiallyAppliedAsyncDefinition<A extends any[], D extends PartialAnyInstancesDefinitionsArgs<A>, R> =
    [] extends A ? () => Promise<R> :
    A extends D ? () => Promise<R> :
    A extends [...SameLength<D>, ...infer TRest] ? (...args:TRest) => Promise<R> : // ...D may be replaced with SameLength<D>?
    never;
