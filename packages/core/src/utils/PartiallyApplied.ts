import { LifeTime } from '../definitions/abstract/LifeTime';
import { AsyncInstanceDefinitionDependency } from '../definitions/abstract/AsyncInstanceDefinitionDependency';
import { InstanceDefinitionDependency } from '../definitions/abstract/InstanceDefinitionDependency';

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
export type PartiallyAppliedDefinition<A extends any[], D extends PartialInstancesDefinitionsArgs<A, any>, R> =
    [] extends A ? () => R :
    A extends D ? () => R :
    A extends [...SameLength<D>, ...infer TRest] ? (...args:TRest) => R :
    never;

type SameLength<T extends any[]> = { [K in keyof T]: any };

// prettier-ignore
export type PartialInstancesDefinitionsArgs<TArgs, TLifeTime extends LifeTime> =
    [] extends TArgs ? []:
    TArgs extends [...infer TPRev, any] ? ( {[K in keyof TArgs]: AsyncInstanceDefinitionDependency<TArgs[K],TLifeTime>} ) | PartialInstancesDefinitionsArgs<TPRev, TLifeTime> : [];

// prettier-ignore
export type PartialAnyInstancesDefinitionsArgs<TArgs extends any[], TLifeTime extends LifeTime> =
    [] extends TArgs ? []:
        TArgs extends [...infer TPRev, any] ? ( {[K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K],TLifeTime>} ) | PartialAnyInstancesDefinitionsArgs<TPRev, TLifeTime> : [];

// prettier-ignore
export type PartiallyAppliedAsyncDefinition<A extends any[], D extends PartialAnyInstancesDefinitionsArgs<A, any>, R> =
    [] extends A ? () => R :
    A extends D ? () => R :
    A extends [...SameLength<D>, ...infer TRest] ? (...args:TRest) => R :
    never;
