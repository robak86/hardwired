import {
  RegistryRecord,
  AbstractDependencyResolver,
  ModuleRegistry,
  ContainerCache,
  ContainerService,
  DependencyResolverFunction
} from '@hardwired/di-core';

export class RequestScopeResolver<TRegistryRecord extends RegistryRecord, TReturn> extends AbstractDependencyResolver<
  TRegistryRecord,
  TReturn
> {
  constructor(private resolver: DependencyResolverFunction<TRegistryRecord, TReturn>) {
    super();
  }

  build = (registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx) => {
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
