import { UnionToIntersection } from 'type-fest';
import { UnknownToNever } from './IsUnknown';
import { IsUnknown } from 'type-fest/source/set-return-type';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition';

export type IsFinite<Tuple, Finite, Infinite> = Tuple extends []
  ? Finite
  : Tuple extends Array<infer Element>
  ? Element[] extends Tuple
    ? Infinite
    : Tuple extends [any, ...infer Rest]
    ? IsFinite<Rest, Finite, Infinite>
    : never
  : never;

type Contains<TItem, TArr extends any[]> = TItem extends TArr[number] ? true : false;

// prettier-ignore
type AppendUnique<TItem, TCollection extends any[]> = Contains<TItem, TCollection> extends false
    ? [...TCollection, TItem]
    : TCollection;

type Merge<T1 extends any[], T2 extends any[]> = MergeUnique<T2, T1, MergeUnique<T1, T2, []>>;

// prettier-ignore
type MergeUnique<T1 extends any[], T2 extends any[], TResult extends any[]> =
    T1 extends [infer TCurrentItem, ...infer TRest] ? MergeUnique<TRest, T2, AppendUnique<TCurrentItem, TResult>> :
    TResult;

// prettier-ignore
type Concat<T> =
    T extends [infer A, ...infer Rest] ? A extends any[] ? Merge<A, Concat<Rest>> : A
        : T;

// prettier-ignore
export type PickExternals<TDepsInstances extends AnyInstanceDefinition<any, any>[]> =
    IsFinite<
        TDepsInstances,
        Concat<{[K in keyof TDepsInstances]: TDepsInstances[K] extends AnyInstanceDefinition<any, infer TExternals> ? TExternals : never}>,
        []
    >

type ExternalsIntersectionRecord<TDepsInstances extends Record<keyof any, AnyInstanceDefinition<any, any>>> =
  UnionToIntersection<
    {
      [K in keyof TDepsInstances]: TDepsInstances[K] extends AnyInstanceDefinition<any, infer TExternal>
        ? UnknownToNever<TExternal>
        : void;
    }[keyof TDepsInstances]
  >;

// prettier-ignore
export type PickExternalsFromRecord<TDepsInstances extends Record<keyof any, AnyInstanceDefinition<any, any>>> =
    IsUnknown<ExternalsIntersectionRecord<TDepsInstances>> extends true ? void : ExternalsIntersectionRecord<TDepsInstances>
