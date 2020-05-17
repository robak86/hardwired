import { nextId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { proxyGetter } from '../container/proxyGetter';
import { DependencyResolver, DependencyResolverFunction } from './DependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';

export class RequestSingletonResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TReturn> {
  static type = 'requestScope';

  public id: string = nextId(); //TODO: not sure if necessary
  public type = RequestSingletonResolver.type;

  constructor(private resolver: DependencyResolverFunction<TRegistry, TReturn>) {}

  build = (registry, ctx, cache: ContainerCache) => {
    if (cache.hasInRequestScope(this.id)) {
      return cache.getFromRequestScope(this.id);
    } else {
      let instance = this.resolver(proxyGetter(registry, cache, ctx));
      cache.setForRequestScope(this.id, instance);
      return instance;
    }
  };
}
