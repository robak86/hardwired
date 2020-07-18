import {
  ModuleRegistry,
  AbstractDependencyResolver,
  DefinitionsSet,
  ContainerCache,
  ContainerService,
  DependencyResolverFunction,
} from '@hardwired/di-core';

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
