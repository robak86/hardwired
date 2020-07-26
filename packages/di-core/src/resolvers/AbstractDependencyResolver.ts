import { ModuleRegistry, DependencyResolver, RegistryRecord } from '..';
import { ContainerCache } from '../container/container-cache';
import { createResolverId } from '../utils/fastId';

export abstract class AbstractDependencyResolver<TRegistryRecord extends RegistryRecord, TReturn>
  implements DependencyResolver<TRegistryRecord, TRegistryRecord> {
  static isConstructorFor(param: DependencyResolver<any, any>): boolean {
    return param.constructor === this;
  }

  public id: string = createResolverId();

  abstract build(registry: ModuleRegistry<TRegistryRecord>, cache: ContainerCache, ctx);
}
