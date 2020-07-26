import { ContainerCache } from '../container/container-cache';
import { MaterializedModuleEntries, RegistryRecord } from '../module/RegistryRecord';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ContainerEvents } from '../container/ContainerEvents';

export type DependencyResolverFunction<TRegistryRecord extends RegistryRecord, TReturn> = (
  container: MaterializedModuleEntries<TRegistryRecord>,
) => TReturn;

export type DependencyResolverReturn<T extends DependencyResolver<any, any>> = T extends DependencyResolver<
  any,
  infer TReturn
>
  ? TReturn
  : never;

export interface DependencyResolver<TRegistryRecord extends RegistryRecord, TReturn> {
  id: string | number;
  build(container: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx): TReturn;
  onRegister?(events: ContainerEvents);
}
