import { ContainerCache } from "../container/container-cache";
import { MaterializedModuleEntries, ModuleRegistry } from "../module/ModuleRegistry";
import { DefinitionsSet } from "../module/DefinitionsSet";
import { ContainerEvents } from "../container/ContainerEvents";

export type DependencyResolverFunction<TRegistry extends ModuleRegistry, TReturn> = (
  container: MaterializedModuleEntries<TRegistry>,
) => TReturn;

export interface DependencyResolver<TRegistry extends ModuleRegistry, TReturn> {
  build(container: DefinitionsSet<TRegistry>, ctx, cache: ContainerCache): TReturn;
  onRegister?(events: ContainerEvents);
}
