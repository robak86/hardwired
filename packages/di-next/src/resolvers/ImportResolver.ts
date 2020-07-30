import { AbstractDependencyResolver, AbstractRegistryDependencyResolver } from './AbstractDependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ModuleBuilder } from '../builders/ModuleBuilder';
import { DependencyResolver } from './DependencyResolver';

export class ImportResolver<TKey extends string, TReturn> extends AbstractRegistryDependencyResolver<TKey, TReturn> {
  constructor(key: TKey, registry: ModuleRegistry<any>) {
    super(key, registry);
  }

  build(registry: ModuleRegistry<any>, cache: ContainerCache, ctx): TReturn {
    // return this.resolver(ContainerService.proxyGetter(registry, cache, ctx));
    throw new Error('Implement me');
  }

  forEach(iterFn: (resolver: DependencyResolver<any, any>) => any) {
    this.registry.forEachDefinition(iterFn);
  }
}

export const importModule = <TKey extends string, TValue>(
  key: TKey,
  value: ModuleBuilder<TValue>,
): ImportResolver<TKey, TValue> => {
  return new ImportResolver(key, value.registry);
};
