import { ContainerCache } from '../container/container-cache';
import { MaterializedModuleEntries, ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';
import { ContainerEvents } from '../container/ContainerEvents';

export type DependencyResolverFunction<TRegistry extends ModuleRegistry, TReturn> = (
  container: MaterializedModuleEntries<TRegistry>,
) => TReturn;

export type DependencyResolverReturn<T extends DependencyResolver<any, any>> = T extends DependencyResolver<
  any,
  infer TReturn
>
  ? TReturn
  : never;

export interface DependencyResolver<TRegistry extends ModuleRegistry, TReturn> {
  id: string | number;
  build(container: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx): TReturn;
  onRegister?(events: ContainerEvents);
}
