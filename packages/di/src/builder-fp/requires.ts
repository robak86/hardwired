import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { GlobalSingletonResolver } from '../resolvers/global-singleton-resolver';
import { DependencyResolver } from '../resolvers/DependencyResolver';

export const external = <TValue>() => <TRegistry extends ModuleRegistry>(
  registry: DefinitionsSet<TRegistry>,
): DependencyResolver<any, TValue> => {
  return new GlobalSingletonResolver(() => null); // TODO: use RequireResolver ? which just applies bunch of runtime checks ?
};
