import {
  RegistryRecord,
  AbstractDependencyResolver,
  ModuleRegistry,
  ContainerCache,
  ContainerService,
} from '@hardwired/di-core';

export class ClassSingletonResolver<TRegistryRecord extends RegistryRecord, TReturn = any> extends AbstractDependencyResolver<
  TRegistryRecord,
  TReturn
> {
  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
  }

  build = (registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx) => {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const constructorArgs = this.selectDependencies(ContainerService.proxyGetter(registry, cache, ctx)) as any;
      const instance = new this.klass(...constructorArgs);
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  };
}
