import { AbstractRegistryDependencyResolver } from "./AbstractDependencyResolver";
import { ModuleRegistry } from "../module/ModuleRegistry";
import { ModuleBuilder } from "../builders/ModuleBuilder";
import { DependencyResolver } from "./DependencyResolver";

export class ImportResolver<TKey extends string, TReturn> extends AbstractRegistryDependencyResolver<TKey, TReturn> {
  constructor(key: TKey, registry: any) {
    super(key, registry);
  }

  build(registry: ModuleRegistry<any>): TReturn {
    const context = {};

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

export const importModule = <TKey extends string, TValue>(
  key: TKey,
  value: ModuleBuilder<TValue>,
): ImportResolver<TKey, TValue> => {
  throw new Error('implement me');
  // return new ImportResolver(key, value.registry);
};
