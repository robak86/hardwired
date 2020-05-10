import { nextId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { containerProxyAccessor } from '../container/container-proxy-accessor';
import { DependencyResolver, DependencyResolverFunction } from './DependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';

export class GlobalSingletonResolver<TRegistry extends ModuleRegistry, TReturn = any>
  implements DependencyResolver<TRegistry, TReturn> {
  public id: string = nextId();

  constructor(private resolver: DependencyResolverFunction<TRegistry, TReturn>) {}

  build = (container, ctx, cache: ContainerCache) => {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      let instance = this.resolver(containerProxyAccessor(container, cache));
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  };
}
