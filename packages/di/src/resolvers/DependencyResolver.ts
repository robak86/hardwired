import { ContainerCache } from '../container/container-cache';
import { MaterializedModuleEntries, ModuleRegistry } from '../module/ModuleRegistry';
import { Container } from '../container/Container';

export type DependencyResolverFunction<TRegistry extends ModuleRegistry, TReturn> = (
  container: MaterializedModuleEntries<TRegistry>,
) => TReturn;

export interface DependencyResolver<TRegistry extends ModuleRegistry, TReturn> {
  build(container: Container<TRegistry>, ctx, cache: ContainerCache): TReturn;
}
