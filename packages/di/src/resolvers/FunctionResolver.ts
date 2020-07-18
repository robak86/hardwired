import {
  AbstractDependencyResolver,
  ContainerCache,
  ContainerService,
  DefinitionsSet,
  ModuleRegistry,
} from '@hardwired/di-core';
import { curry } from '../utils/curry';

// TODO: not sure if this should be singleton ?
//  or we should memoize the function by dependencySelect ?  +1
//  or it shouldn't never be memoized ?
export class FunctionResolver<TRegistry extends ModuleRegistry, TReturn> extends AbstractDependencyResolver<
  TRegistry,
  TReturn
> {
  private readonly curriedFunction;
  private readonly uncurriedFunction;
  private readonly selectDependencies;
  private previousDependencies: any[] = [];

  constructor(fn: (...args: any[]) => any, depSelect) {
    super();
    this.uncurriedFunction = fn;
    this.curriedFunction = curry(fn);
    this.selectDependencies = depSelect ? depSelect : () => [];
  }

  build(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) {
    // TODO: not sure if this does not trigger all getter from the whole tree !!!!
    const currentDependencies = this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx));
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
