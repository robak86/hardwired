import { createResolverId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { DependencyResolverFunction } from './DependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { ContainerService } from '../container/ContainerService';
import { AbstractDependencyResolver } from './AbstractDependencyResolver';

export class RequestScopeResolver<TRegistry extends ModuleRegistry, TReturn> extends AbstractDependencyResolver<
  TRegistry,
  TReturn
> {
  constructor(private resolver: DependencyResolverFunction<TRegistry, TReturn>) {
    super();
  }

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    //TODO: cache.forNewRequest scope!!
    if (cache.hasInRequestScope(this.id)) {
      return cache.getFromRequestScope(this.id);
    } else {
      let instance = this.resolver(ContainerService.proxyGetter(registry, cache, ctx));
      cache.setForRequestScope(this.id, instance);
      return instance;
    }
  };
}
