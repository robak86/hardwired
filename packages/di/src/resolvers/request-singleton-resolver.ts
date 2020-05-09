import { nextId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { containerProxyAccessor } from '../container/container-proxy-accessor';
import { DependencyResolver, DependencyResolverFunction } from './DependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';

export class RequestSingletonResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TReturn> {
  public id: string = nextId(); //TODO: not sure if necessary

  constructor(private resolver: DependencyResolverFunction<TRegistry, TReturn>) {}

  build = (container, ctx, cache: ContainerCache) => {
    if (cache.hasInRequestScope(this.id)) {
      return cache.getFromRequestScope(this.id);
    } else {
      let instance = this.resolver(containerProxyAccessor(container, cache));
      cache.setForRequestScope(this.id, instance);
      return instance;
    }
  };
}
