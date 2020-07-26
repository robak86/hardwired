import {
  RegistryRecord,
  AbstractDependencyResolver,
  ModuleRegistry,
  ContainerCache,
  ContainerService,
} from '@hardwired/di-core';

export class ClassRequestScopeResolver<
  TRegistryRecord extends RegistryRecord,
  TReturn = any
> extends AbstractDependencyResolver<TRegistryRecord, TReturn> {
  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
  }

  build = (registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx) => {
    const scopedCache = cache.isScoped() ? cache : cache.forNewRequest();

    if (scopedCache.hasInGlobalScope(this.id)) {
      return scopedCache.getFromGlobalScope(this.id);
    } else {
      const constructorArgs = this.selectDependencies(ContainerService.proxyGetter(registry, scopedCache, ctx)) as any;
      const instance = new this.klass(...constructorArgs);
      scopedCache.setForGlobalScope(this.id, instance);
      return instance;
    }
  };
}
