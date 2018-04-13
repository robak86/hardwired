import { createResolverId } from '../utils/fastId';
import { RegistryLookup } from '../module/RegistryLookup';
import { RegistryRecord } from '../module/RegistryRecord';
import { Module } from '../builders/Module';
import { ContainerCache } from '../container/container-cache';
import { ImmutableSet } from '../collections/ImmutableSet';
import { ModuleId } from '../module-id';

export abstract class AbstractDependencyResolver<TReturn> {
  public readonly id: string = createResolverId();
  public readonly type: 'dependency' = 'dependency';

  protected constructor() {}

  // TODO: splitting build into two steps solves problem of providing registry by the container. AbstractDependencyResolver may cache
  abstract build(cache: ContainerCache): TReturn;
  onInit?(registry: RegistryLookup);
}

export abstract class AbstractModuleResolver<TReturn extends RegistryRecord> {
  public readonly id: string = createResolverId();
  public readonly type: 'module' = 'module';

  protected constructor(public registry: Module<any>) {}

  abstract build(injections?: ImmutableSet<any>): [TReturn, RegistryLookup];

  get moduleId(): ModuleId {
    return this.registry.moduleId;
  }
}
