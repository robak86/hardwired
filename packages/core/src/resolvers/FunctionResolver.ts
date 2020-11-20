import { curry } from '../utils/curry';
import { AbstractDependencyResolver } from './abstract/AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';
import { Instance } from "./abstract/Instance";

// TODO: not sure if this should be singleton ?
//  or we should memoize the function by dependencySelect ?  +1
//  or it shouldn't never be memoized ?
export class FunctionResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  private readonly curriedFunction;
  private readonly uncurriedFunction;
  private previousDependencies: any[] = [];

  constructor(fn: (...args: any[]) => any, private depSelect: Array<Instance<any>> = []) {
    super();
    this.uncurriedFunction = fn;
    this.curriedFunction = curry(fn);
  }

  build(cache: ContainerContext): TReturn {
    // TODO: not sure if this does not trigger all getter from the whole tree !!!!
    const currentDependencies = this.depSelect.map(factory => factory.get(cache));
    const requiresRevalidation = currentDependencies.some((val, idx) => val !== this.previousDependencies[idx]);

    if (requiresRevalidation) {
      this.previousDependencies = currentDependencies;
      const instance = this.buildFunction(currentDependencies);
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }

    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      let instance = this.buildFunction(currentDependencies);
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
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
  <TResult>(fn: () => TResult): FunctionResolver<() => TResult>;
  <TDep1, TResult>(fn: (d1: TDep1) => TResult): FunctionResolver<(d1: TDep1) => TResult>;
  <TDep1, TResult>(fn: (d1: TDep1) => TResult, depSelect: [Instance<TDep1>]): FunctionResolver<() => TResult>;
  <TDep1, TDep2, TResult>(fn: (d1: TDep1, d2: TDep2) => TResult): FunctionResolver<(d1: TDep1, d2: TDep2) => TResult>;
  <TDep1, TDep2, TResult>(
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: [Instance<TDep1>],
  ): FunctionResolver<(dep2: TDep2) => TResult>;
  <TDep1, TDep2, TResult>(
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: [Instance<TDep1>, Instance<TDep2>],
  ): FunctionResolver<() => TResult>;
  // 3 args
  <TDep1, TDep2, TDep3, TResult>(fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult): FunctionResolver<
    (d1: TDep1, d2: TDep2, d3: TDep3) => TResult
  >;
  <TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: [Instance<TDep1>],
  ): FunctionResolver<(dep2: TDep2, dep3: TDep3) => TResult>;
  <TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: [Instance<TDep1>, Instance<TDep2>],
  ): FunctionResolver<(dep3: TDep3) => TResult>;
  <TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: [Instance<TDep1>, Instance<TDep2>, Instance<TDep3>],
  ): FunctionResolver<() => TResult>;
  <TDep1, TDep2, TDep3, TDep4, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3, d4: TDep4) => TResult,
    depSelect: [Instance<TDep1>, Instance<TDep2>, Instance<TDep3>, Instance<TDep4>],
  ): FunctionResolver<() => TResult>;
};

export const func: FunctionResolverBuilder = (fn, deps?) => {
  return new FunctionResolver(fn, deps) as any;
};
