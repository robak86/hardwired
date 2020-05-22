import { MaterializedModuleEntries, ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';
import { DependencyResolver } from '../resolvers/DependencyResolver';

export const singleton = <TRegistry extends ModuleRegistry, TValue>(
  factory: (container: MaterializedModuleEntries<TRegistry>) => TValue,
) => (registry: DefinitionsSet<TRegistry>): DependencyResolver<TRegistry, TValue> => {
  return new GlobalSingletonResolver(factory);
};
