import { MaterializedModuleEntries, ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { DependencyResolver } from '../resolvers/DependencyResolver';
import { TransientResolver } from '../resolvers/TransientResolver';

export const transient = <TRegistry extends ModuleRegistry, TValue>(
  factory: (container: MaterializedModuleEntries<TRegistry>) => TValue,
) => (registry: DefinitionsSet<TRegistry>): DependencyResolver<TRegistry, TValue> => {
  return new TransientResolver(factory);
};
