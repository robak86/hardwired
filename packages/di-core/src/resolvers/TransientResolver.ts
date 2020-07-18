import { ModuleRegistry } from '../module/ModuleRegistry';
import { DependencyResolverFunction } from './DependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { ContainerService } from '../container/ContainerService';
import { AbstractDependencyResolver } from './AbstractDependencyResolver';

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
