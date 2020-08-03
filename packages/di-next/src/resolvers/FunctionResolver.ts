import { curry } from '../utils/curry';
import { AbstractDependencyResolver } from './AbstractDependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ContainerCache } from '../container/container-cache';
import { ContainerService } from '../container/ContainerService';
import { DependencyFactory } from '../draft';

// TODO: not sure if this should be singleton ?
//  or we should memoize the function by dependencySelect ?  +1
//  or it shouldn't never be memoized ?
export class FunctionResolver<TRegistryRecord extends string, TReturn> extends AbstractDependencyResolver<
  TRegistryRecord,
  TReturn
> {
  private readonly curriedFunction;
  private readonly uncurriedFunction;
  private readonly selectDependencies;
  private previousDependencies: any[] = [];

  constructor(key, fn: (...args: any[]) => any, depSelect) {
    super(key);
    this.uncurriedFunction = fn;
    this.curriedFunction = curry(fn);
    this.selectDependencies = depSelect ? depSelect : () => [];
  }

  build(registry: ModuleRegistry<any>):DependencyFactory<TReturn> {
    // TODO: not sure if this does not trigger all getter from the whole tree !!!!
    // const currentDependencies = this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx));
    // const requiresRevalidation = currentDependencies.some((val, idx) => val !== this.previousDependencies[idx]);
    //
    // if (requiresRevalidation) {
    //   this.previousDependencies = currentDependencies;
    //   const instance = this.buildFunction(currentDependencies);
    //   cache.setForGlobalScope(this.id, instance);
    //   return instance;
    // }
    //
    // if (cache.hasInGlobalScope(this.id)) {
    //   return cache.getFromGlobalScope(this.id);
    // } else {
    //   let instance = this.buildFunction(currentDependencies);
    //   cache.setForGlobalScope(this.id, instance);
    //   return instance;
    // }

    throw new Error("Implement me")
  }

  private buildFunction(params) {
    if (params.length === this.uncurriedFunction.length) {
      return () => this.uncurriedFunction(...params);
    } else {
      return this.curriedFunction(...params);
    }
  }
}

type FunctionResolverBuilder = {
  <TKey extends string, TResult>(key: TKey, fn: () => TResult): FunctionResolver<TKey, () => TResult>;
  <TKey extends string, TDep1, TResult>(key: TKey, fn: (d1: TDep1) => TResult): FunctionResolver<
    TKey,
    (d1: TDep1) => TResult
  >;
  <TKey extends string, TDep1, TResult>(
    key: TKey,
    fn: (d1: TDep1) => TResult,
    depSelect: [DependencyFactory<TDep1>],
  ): FunctionResolver<TKey, () => TResult>;
  <TKey extends string, TDep1, TDep2, TResult>(key: TKey, fn: (d1: TDep1, d2: TDep2) => TResult): FunctionResolver<
    TKey,
    (d1: TDep1, d2: TDep2) => TResult
  >;
  <TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: [DependencyFactory<TDep1>],
  ): FunctionResolver<TKey, (dep2: TDep2) => TResult>;
  <TKey extends string, TDep1, TDep2, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: [DependencyFactory<TDep1>, DependencyFactory<TDep2>],
  ): FunctionResolver<TKey, () => TResult>;
  // 3 args
  <TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
  ): FunctionResolver<TKey, (d1: TDep1, d2: TDep2, d3: TDep3) => TResult>;
  <TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: [DependencyFactory<TDep1>],
  ): FunctionResolver<TKey, (dep2: TDep2, dep3: TDep3) => TResult>;
  <TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: [DependencyFactory<TDep1>, DependencyFactory<TDep2>],
  ): FunctionResolver<TKey, (dep3: TDep3) => TResult>;
  <TKey extends string, TDep1, TDep2, TDep3, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: [DependencyFactory<TDep1>, DependencyFactory<TDep2>, DependencyFactory<TDep3>],
  ): FunctionResolver<TKey, () => TResult>;
  <TKey extends string, TDep1, TDep2, TDep3, TDep4, TResult>(
    key: TKey,
    fn: (d1: TDep1, d2: TDep2, d3: TDep3, d4: TDep4) => TResult,
    depSelect: [DependencyFactory<TDep1>, DependencyFactory<TDep2>, DependencyFactory<TDep3>, DependencyFactory<TDep4>],
  ): FunctionResolver<TKey, () => TResult>;
};


export const fun: FunctionResolverBuilder = (...args: any[]) => {
  return null as any;
};
