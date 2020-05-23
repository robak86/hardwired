import { DependencyResolver } from './DependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { curry } from '../utils/curry';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { nextId } from '../utils/fastId';
import { proxyGetter } from '../container/proxyGetter';

// TODO: not sure if this should be singleton ?
//  or we should memoize the function by dependencySelect ?  +1
//  or it shouldn't never be memoized ?
export class FunctionResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TReturn> {
  static type = 'function';

  public id: string = nextId();
  public type = FunctionResolver.type;

  private readonly curriedFunction;
  private readonly uncurriedFunction;
  private readonly selectDependencies;
  private previousDependencies: any[] = [];

  constructor(fn: (...args: any[]) => any, depSelect) {
    this.uncurriedFunction = fn;
    this.curriedFunction = curry(fn);
    this.selectDependencies = depSelect ? depSelect : () => [];
  }

  build(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) {
    // TODO: not sure if this does not trigger all getter from the whole tree !!!!
    const currentDependencies = this.selectDependencies(proxyGetter(registry, cache, ctx));
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
