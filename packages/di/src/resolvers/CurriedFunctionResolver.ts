import { DependencyResolver } from './DependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { curry } from '../utils/curry';
import { GlobalSingletonResolver } from './global-singleton-resolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { Container } from "../container/Container";

// TODO: not sure if this should be singleton ?
//  or we should memoize the function by dependencySelect ?  +1
//  or it shouldn't never be memoized ?
export class CurriedFunctionResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TReturn> {
  private readonly singletonResolver: GlobalSingletonResolver<TRegistry, TReturn>;

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

  build(container: Container<TRegistry>, ctx, cache: ContainerCache) {
    return this.singletonResolver.build(container, ctx, cache);
  }
}
