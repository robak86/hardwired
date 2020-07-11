import { DefinitionsSet, DependencyResolver, ModuleRegistry } from '..';
import { ContainerCache } from '../container/container-cache';
import { createResolverId } from '../utils/fastId';

export abstract class AbstractDependencyResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TRegistry> {
  static isConstructorFor(param: DependencyResolver<any, any>): boolean {
    return param.constructor === this;
  }

  public id: string = createResolverId();

  abstract build(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx);
}