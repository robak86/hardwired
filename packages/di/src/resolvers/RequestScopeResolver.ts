import { createResolverId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { proxyGetter } from '../container/proxyGetter';
import { DependencyResolver, DependencyResolverFunction } from './DependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';

export class RequestScopeResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TReturn> {
  static type = 'requestScope';

  public id: string = createResolverId(); //TODO: not sure if necessary
  public type = RequestScopeResolver.type;

  constructor(private resolver: DependencyResolverFunction<TRegistry, TReturn>) {}

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    //TODO: cache.forNewRequest scope!!
    if (cache.hasInRequestScope(this.id)) {
      return cache.getFromRequestScope(this.id);
    } else {
      let instance = this.resolver(proxyGetter(registry, cache, ctx));
      cache.setForRequestScope(this.id, instance);
      return instance;
    }
  };
}
