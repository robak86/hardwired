import { nextId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { proxyGetter } from '../container/proxyGetter';
import { DependencyResolver } from './DependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';

export class ClassRequestScopeResolver<TRegistry extends ModuleRegistry, TReturn = any>
  implements DependencyResolver<TRegistry, TReturn> {
  static type = 'requestScope';

  public id: string = nextId();
  public type = ClassRequestScopeResolver.type;

  constructor(private klass, private selectDependencies = container => [] as any[]) {}

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    const scopedCache = cache.isScoped() ? cache : cache.forNewRequest();

    if (scopedCache.hasInGlobalScope(this.id)) {
      return scopedCache.getFromGlobalScope(this.id);
    } else {
      const constructorArgs = this.selectDependencies(proxyGetter(registry, scopedCache, ctx)) as any;
      const instance = new this.klass(...constructorArgs);
      scopedCache.setForGlobalScope(this.id, instance);
      return instance;
    }
  };
}
