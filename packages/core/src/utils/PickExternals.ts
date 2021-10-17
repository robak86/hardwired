import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition';
import { filterDuplicates, FilterDuplicates } from './FilterDuplicates';
import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { IsFinite } from './IsFinite';

type Concat<T> = T extends [infer A, ...infer Rest] ? (A extends any[] ? [...A, ...Concat<Rest>] : A) : T;

// prettier-ignore
export type PickExternals<TDepsInstances extends AnyInstanceDefinition<any, any, any>[]> =
    IsFinite<
        TDepsInstances,
        FilterDuplicates<Concat<{[K in keyof TDepsInstances]: TDepsInstances[K] extends AnyInstanceDefinition<any,any, infer TExternals> ? TExternals : never}>>,
        []
    >

export const pickExternals = (externals: AnyInstanceDefinition<any, any, any>[]): InstanceDefinition<any, any, any>[] => {
  return filterDuplicates(externals.flatMap(def => def.externals));
};
