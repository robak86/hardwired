import { ModuleRegistry } from '../module/ModuleRegistry';
import { DependencyResolver, DependencyResolverFunction } from './DependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { proxyGetter } from '../container/proxyGetter';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { nextId } from '../utils/fastId';

export class TransientResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TReturn> {
  static type = 'transient';

  public id: string = nextId();
  public type = TransientResolver.type;

  constructor(private resolver: DependencyResolverFunction<TRegistry, TReturn>) {}

  build(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx): TReturn {
    return this.resolver(proxyGetter(registry, cache, ctx));
  }
}
