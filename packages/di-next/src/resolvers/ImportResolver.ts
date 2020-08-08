import { AbstractRegistryDependencyResolver } from './AbstractDependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ModuleBuilder } from '../builders/ModuleBuilder';
import { DependencyResolver } from './DependencyResolver';
import { RegistryRecord } from '../module/RegistryRecord';

// TODO: how to implement module.replace() ?!?!?
// prepending entries won't work, because we wont' have the correct materialized object
// appending entries may work, but we need to make sure that any reference is not bind during reducing entries
export class ImportResolver<
  TKey extends string,
  TReturn extends RegistryRecord
> extends AbstractRegistryDependencyResolver<TKey, TReturn> {
  constructor(key: TKey, registry: ModuleBuilder<TReturn>) {
    super(key, registry);
  }

  build(): ModuleRegistry<TReturn> {
    // const context = ModuleRegistry.empty(this.registry.moduleId.name);
    //
    // const byKey = this.registry.entries.reduce((grouped, entry) => {
    //   const resolver = entry(context);
    //
    //   context[resolver.key] = (cache: ContainerCache) => {
    //     resolver.build(registry, cache, ctx);
    //   };
    //
    //   return grouped;
    // }, {});

    // return this.resolver(ContainerService.proxyGetter(registry, cache, ctx));
    throw new Error('Implement me');
  }

  forEach(iterFn: (resolver: DependencyResolver<any, any>) => any) {
    // this.registry.forEachDefinition(iterFn);
  }
}

export const importModule = <TKey extends string, TValue extends RegistryRecord>(
  key: TKey,
  value: ModuleBuilder<TValue>,
): ImportResolver<TKey, TValue> => {
  throw new Error('implement me');
  // return new ImportResolver(key, value.registry);
};
