import { DependencyResolver } from './DependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { curry } from '../utils/curry';
import { GlobalSingletonResolver } from './global-singleton-resolver';

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
