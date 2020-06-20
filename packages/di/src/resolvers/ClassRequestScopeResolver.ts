import { createResolverId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { ContainerService } from '../container/ContainerService';
import { AbstractDependencyResolver } from './AbstractDependencyResolver';

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
