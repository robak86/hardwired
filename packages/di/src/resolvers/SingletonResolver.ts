import {
  ModuleRegistry,
  AbstractDependencyResolver,
  DefinitionsSet,
  ContainerCache,
  ContainerService,
  DependencyResolverFunction
} from '@hardwired/di-core';

export class SingletonResolver<TRegistry extends ModuleRegistry, TReturn = any> extends AbstractDependencyResolver<
  TRegistry,
  TReturn
> {
  constructor(private resolver: DependencyResolverFunction<TRegistry, TReturn>) {
    super();
  }

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      let instance = this.resolver(ContainerService.proxyGetter(registry, cache, ctx));
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  };
}
