import { ModuleRegistry } from '../module/ModuleRegistry';
import { DependencyResolver, DependencyResolverFunction } from './DependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { proxyGetter } from '../container/proxyGetter';
import { DefinitionsSet } from '../module/DefinitionsSet';

export class TransientResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TReturn> {
  constructor(private resolver: DependencyResolverFunction<TRegistry, TReturn>) {}

  build(registry: DefinitionsSet<TRegistry>, ctx, cache: ContainerCache): TReturn {
    return this.resolver(proxyGetter(registry, cache, ctx));
  }
}
