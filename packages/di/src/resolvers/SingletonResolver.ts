import { nextId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { proxyGetter } from '../container/proxyGetter';
import { DependencyResolver, DependencyResolverFunction } from './DependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';

export class SingletonResolver<TRegistry extends ModuleRegistry, TReturn = any>
  implements DependencyResolver<TRegistry, TReturn> {
  static type = 'singleton';

  public id: string = nextId();
  public type = SingletonResolver.type;

  constructor(private resolver: DependencyResolverFunction<TRegistry, TReturn>) {}

  build = (registry:DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      let instance = this.resolver(proxyGetter(registry, cache, ctx));
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  };
}
