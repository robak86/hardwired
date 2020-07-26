import { AbstractDependencyResolver } from './AbstractDependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { RegistryRecord } from '../module/RegistryRecord';
import { ContainerService } from '../container/ContainerService';
import { DependencyResolverFunction } from './DependencyResolver';

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
