import { AbstractDependencyResolver } from './AbstractDependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ContainerService } from '../container/ContainerService';
import { DependencyResolverFunction } from './DependencyResolver';

export class TransientResolver<TRegistry extends ModuleRegistry, TReturn> extends AbstractDependencyResolver<
  TRegistry,
  TReturn
> {
  constructor(private resolver: DependencyResolverFunction<TRegistry, TReturn>) {
    super();
  }

  build(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx): TReturn {
    return this.resolver(ContainerService.proxyGetter(registry, cache, ctx));
  }
}
