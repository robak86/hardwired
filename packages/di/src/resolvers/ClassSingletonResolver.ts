import {
  ModuleRegistry,
  AbstractDependencyResolver,
  DefinitionsSet,
  ContainerCache,
  ContainerService,
} from '@hardwired/di-core';

export class ClassSingletonResolver<TRegistry extends ModuleRegistry, TReturn = any> extends AbstractDependencyResolver<
  TRegistry,
  TReturn
> {
  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
  }

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
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
