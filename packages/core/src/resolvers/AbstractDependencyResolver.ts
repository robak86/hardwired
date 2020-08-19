import { createResolverId } from '../utils/fastId';
import { RegistryLookup } from '../module/RegistryLookup';
import { RegistryRecord } from '../module/RegistryRecord';
import { Module } from '../module/Module';
import { ContainerContext } from '../container/ContainerContext';
import { ImmutableSet } from '../collections/ImmutableSet';
import { ModuleId } from '../module/ModuleId';

export abstract class AbstractDependencyResolver<TReturn> {
  public readonly id: string = createResolverId();
  public readonly type: 'dependency' = 'dependency';

  protected constructor() {}

  abstract build(cache: ContainerContext): TReturn;
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
