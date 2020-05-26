import { DefinitionsSet, DependencyResolver, ModuleRegistry } from '..';
import { ContainerCache } from '../container/container-cache';
import { nextId } from '../utils/fastId';

export abstract class BaseDependencyResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TRegistry> {
  public id: string = nextId();

  abstract readonly type: string;
  abstract build(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx);
}
