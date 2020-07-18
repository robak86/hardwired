import {
  ModuleRegistry,
  AbstractDependencyResolver,
  DefinitionsSet,
  ContainerCache,
  ContainerService,
} from '@hardwired/di-core';

export class ClassRequestScopeResolver<
  TRegistry extends ModuleRegistry,
  TReturn = any
> extends AbstractDependencyResolver<TRegistry, TReturn> {
  constructor(private klass, private selectDependencies = container => [] as any[]) {
    super();
  }

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
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
