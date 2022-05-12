import { filterDuplicates } from './FilterDuplicates';
import { WithExternals } from '../definitions/abstract/base/BaseDefinition';
import { IsNever, IsUnknown } from './TypesHelpers';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';
import { Simplify } from 'type-fest';
import { ExternalsValues } from "../container/Container";

// prettier-ignore
// export type PickExternals<T> =
//     UnknownToNever<
//         T extends [infer A] ? ExtractExternals<A> :
//         T extends [infer A, ...infer Rest] ? Merge<ExtractExternals<A>,PickExternals<Rest>> :
//         never
//       >
//
// type Merge<T1, T2> = NeverToUnknown<T1> & NeverToUnknown<T2>;

type A = never | 1

// prettier-ignore
export type PickExternals<T> =
    // // UnknownToNever<
    //     T extends [] ? never :
    //     T extends [infer A] ? ExtractExternals<A> :
    //     T extends [infer A, ...infer Rest] ? (NeverToUnknown<ExtractExternals<A>> & NeverToUnknown<PickExternals<Rest>>) :
    //     never
    //     // >

UnknownToNever<
    T extends [] ? never :
    T extends [infer A] ? ExtractExternals<A> :
    T extends [infer A, ...infer Rest] ? (NeverToUnknown<ExtractExternals<A>> & NeverToUnknown<PickExternals<Rest>>) :
    never
>

// export type PickExternals<T> = PickExternalsRec<T>

type ZZZ<T> = T extends [infer A] ? 1 : T extends [infer A, ...infer Rest] ? 2 : never;

type ExtractExternals<T> =
    T extends WithExternals<never> ? never :
    T extends WithExternals<infer TExternals> ? TExternals : 'WTF';

type CO_DO_KURWY = ExtractExternals<InstanceDefinition<any, any, never>>;

type AA = PickExternals<[WithExternals<{ b: 1 }>, WithExternals<never>]>;
type sdfsAA = PickExternals<[WithExternals<never>]>;
type asdfasfd = PickExternals<[InstanceDefinition<any, any, never>]>;
type sdfAA = PickExternals<[WithExternals<never>, WithExternals<{ b: 1 }>]>;
type AAs = PickExternals<[WithExternals<{ b: 1 }>]>;
type AsdfA = PickExternals<[WithExternals<never>]>;
type AsasdfdfA = UnknownToNever<PickExternals<[WithExternals<never>, WithExternals<never>]>>;
type AssddfA = PickExternals<[]>;

export type UnknownToNever<T> = IsUnknown<T> extends true ? never : T;
export type NeverToUnknown<T> = IsNever<T> extends true ? unknown : T;

// prettier-ignore
// export type PickExternals<TDepsInstances extends WithExternals<any>[]> =
//     // UnknownToNever<UnionToIntersection<TDepsInstances[number] extends AnyInstanceDefinition<any, any, infer TExternals> ? TExternals : never>>
//     Concat<TDepsInstances>
// // IsFinite<
// //     TDepsInstances,
// //     // FilterDuplicates<Concat<{[K in keyof TDepsInstances]: TDepsInstances[K] extends AnyInstanceDefinition<any,any, infer TExternals> ? TExternals : never}>>,
// //     UnionToIntersection<{ [K in keyof TDepsInstances]: TDepsInstances[K] extends AnyInstanceDefinition<any, any, infer TExternals> ? TExternals : never }>,
// //     []
// // >

export const pickExternals = <T extends WithExternals<any>[]>(externals: T): ExternalsValues<PickExternals<T>> => {
  return filterDuplicates(externals.flatMap(def => def.externals));
};
