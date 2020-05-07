import { DependencyResolver } from './DependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { curry } from '../utils/curry';
import { GlobalSingletonResolver } from './global-singleton-resolver';
import { MaterializedModuleEntries } from '..';

// TODO: not sure if this should be singleton ?
//  or we should memoize the function by dependencySelect ?  +1
//  or it shouldn't never be memoized ?
export class CurriedFunctionResolver<TRegistry, TContext, TReturn>
  implements DependencyResolver<TRegistry, TContext, TReturn> {
  private readonly singletonResolver: GlobalSingletonResolver<TRegistry, TContext, TReturn>;

  constructor(fn, depSelect) {
    const curried = curry(fn);
    const select = depSelect ? depSelect : () => [];

    this.singletonResolver = new GlobalSingletonResolver<any>(container => {
      const params = select(container);
      if (params.length === fn.length) {
        return () => fn(...params);
      } else {
        return curried(...params);
      }
    });
  }

  build(container: TRegistry, ctx, cache: ContainerCache) {
    return this.singletonResolver.build(container, ctx, cache);
  }
}

export const fun: CurriedFunction = null as any;

type CurriedFunction = {
  <TKey extends string, TResult>(fn: () => TResult): DependencyResolver<any, any, () => TResult>;
  <TKey extends string, TDep1, TResult>(fn: (d1: TDep1) => TResult): DependencyResolver<
    any,
    any,
    (d1: TDep1) => TResult
  >;
  <TKey extends string, TDep1, TResult>(fn: (d1: TDep1) => TResult, depSelect: [TDep1]): DependencyResolver<
    any,
    any,
    () => TResult
  >;
  <TKey extends string, TDep1, TDep2, TResult>(fn: (d1: TDep1, d2: TDep2) => TResult): DependencyResolver<
    any,
    any,
    (d1: TDep1, d2: TDep2) => TResult
  >;
  <TKey extends string, TDep1, TDep2, TResult>(
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: [TDep1],
  ): DependencyResolver<any, any, (dep2: TDep2) => TResult>;
  <TKey extends string, TDep1, TDep2, TResult>(
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: [TDep1, TDep2],
  ): DependencyResolver<any, any, () => TResult>;
  // 3 args
  <TKey extends string, TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
  ): DependencyResolver<any, any, (d1: TDep1, d2: TDep2, d3: TDep3) => TResult>;
  <TKey extends string, TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: [TDep1],
  ): DependencyResolver<any, any, (dep2: TDep2, dep3: TDep3) => TResult>;
  <TKey extends string, TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: [TDep1, TDep2],
  ): DependencyResolver<any, any, (dep3: TDep3) => TResult>;
  <TKey extends string, TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: [TDep1, TDep2, TDep3],
  ): DependencyResolver<any, any, () => TResult>;
};
