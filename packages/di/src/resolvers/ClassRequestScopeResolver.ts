import { createResolverId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { DependencyResolver } from './DependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { ContainerService } from '../container/ContainerService';

export class ClassRequestScopeResolver<TRegistry extends ModuleRegistry, TReturn = any>
  implements DependencyResolver<TRegistry, TReturn> {
  static readonly type = 'requestScope';

  public id: string = createResolverId();
  readonly type = ClassRequestScopeResolver.type;

  constructor(private klass, private selectDependencies = container => [] as any[]) {}

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
