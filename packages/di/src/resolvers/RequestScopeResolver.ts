import {
  ModuleRegistry,
  AbstractDependencyResolver,
  DefinitionsSet,
  ContainerCache,
  ContainerService,
  DependencyResolverFunction
} from '@hardwired/di-core';

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
