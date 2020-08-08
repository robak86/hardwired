import { AbstractRegistryDependencyResolver } from './AbstractDependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ModuleBuilder } from '../builders/ModuleBuilder';
import { DependencyResolver } from './DependencyResolver';
import { RegistryRecord } from '../module/RegistryRecord';

// TODO: how to implement module.replace() ?!?!?
// prepending entries won't work, because we wont' have the correct materialized object
// appending entries may work, but we need to make sure that any reference is not bind during reducing entries
export class ImportResolver<TReturn extends RegistryRecord> extends AbstractRegistryDependencyResolver<TReturn> {
  private resolvers = {};

  constructor(registry: ModuleBuilder<TReturn>) {
    super(registry);
  }

  build(): ModuleRegistry<TReturn> {
    // const context = ModuleRegistry.empty(this.registry.moduleId.name);
    // const implementations = {};
    //
    // const byKey = this.registry.entries.reduce((grouped, entry) => {
    //   const resolver = entry(context);
    //   implementations[resolver.key] = resolver;
    //
    //   if (!context[resolver.key]) {
    //     context[resolver.key] = (cache: ContainerCache) => {
    //       implementations[resolver.key].build(this.registry)(cache);
    //     };
    //   }
    //
    //   return grouped;
    // }, {});

    // return this.resolver(ContainerService.proxyGetter(registry, cache, ctx));
    throw new Error('Implement me');
  }

  forEach(iterFn: (resolver: DependencyResolver<any>) => any) {
    // this.registry.forEachDefinition(iterFn);
  }
}

export const importModule = <TValue extends RegistryRecord>(value: ModuleBuilder<TValue>): ImportResolver<TValue> => {
  throw new Error('implement me');
  // return new ImportResolver(key, value.registry);
};
