import { nextId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { proxyGetter } from '../container/proxyGetter';
import { DependencyResolver, DependencyResolverFunction } from './DependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';

export class GlobalSingletonResolver<TRegistry extends ModuleRegistry, TReturn = any>
  implements DependencyResolver<TRegistry, TReturn> {
  public id: string = nextId();

  constructor(private resolver: DependencyResolverFunction<TRegistry, TReturn>) {}

  build = (registry, ctx, cache: ContainerCache) => {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      let instance = this.resolver(proxyGetter(registry, cache, ctx));
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  };
}
