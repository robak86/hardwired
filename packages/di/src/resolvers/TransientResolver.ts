import {
  RegistryRecord,
  AbstractDependencyResolver,
  ModuleRegistry,
  ContainerCache,
  ContainerService,
  DependencyResolverFunction,
} from '@hardwired/di-core';

export class TransientResolver<TRegistryRecord extends RegistryRecord, TReturn> extends AbstractDependencyResolver<
  TRegistryRecord,
  TReturn
> {
  constructor(private resolver: DependencyResolverFunction<TRegistryRecord, TReturn>) {
    super();
  }

  build(registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx): TReturn {
    return this.resolver(ContainerService.proxyGetter(registry, cache, ctx));
  }
}
