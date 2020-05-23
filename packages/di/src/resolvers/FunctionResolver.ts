import { DependencyResolver } from './DependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { curry } from '../utils/curry';
import { GlobalSingletonResolver } from './global-singleton-resolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { nextId } from '../utils/fastId';

// TODO: not sure if this should be singleton ?
//  or we should memoize the function by dependencySelect ?  +1
//  or it shouldn't never be memoized ?
export class FunctionResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TReturn> {
  static type = 'function';

  public id: string = nextId();
  public type = FunctionResolver.type;

  private readonly singletonResolver: GlobalSingletonResolver<TRegistry, TReturn>;

  constructor(fn: (...args: any[]) => any, depSelect) {
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

  build(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) {
    return this.singletonResolver.build(registry, cache, ctx);
  }
}
