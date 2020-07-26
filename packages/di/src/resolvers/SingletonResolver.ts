import {
  RegistryRecord,
  AbstractDependencyResolver,
  ModuleRegistry,
  ContainerCache,
  ContainerService,
  DependencyResolverFunction
} from '@hardwired/di-core';

export class SingletonResolver<TRegistryRecord extends RegistryRecord, TReturn = any> extends AbstractDependencyResolver<
  TRegistryRecord,
  TReturn
> {
  constructor(private resolver: DependencyResolverFunction<TRegistryRecord, TReturn>) {
    super();
  }

  build = (registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx) => {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      let instance = this.resolver(ContainerService.proxyGetter(registry, cache, ctx));
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  };
}
