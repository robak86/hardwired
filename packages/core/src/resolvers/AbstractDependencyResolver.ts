import { createResolverId } from "../utils/fastId";
import { RegistryLookup } from "../module/RegistryLookup";
import { RegistryRecord } from "../module/RegistryRecord";
import { Module } from "../module/Module";
import { ContainerContext } from "../container/ContainerContext";
import { ImmutableSet } from "../collections/ImmutableSet";
import { ModuleId } from "../module/ModuleId";

export abstract class AbstractDependencyResolver<TReturn> {
  public readonly id: string = createResolverId();
  public readonly type: 'dependency' = 'dependency';

  protected constructor() {}

  abstract build(cache: ContainerContext): TReturn;
  onInit?(registry: RegistryLookup<any>);
}

export abstract class AbstractModuleResolver<TReturn extends RegistryRecord> {
  public readonly id: string = createResolverId();
  public readonly type: 'module' = 'module';

  protected constructor(public registry: Module<any>) {}

  abstract build(cache: ContainerContext, injections?: ImmutableSet<any>): RegistryLookup<TReturn>;

  get moduleId(): ModuleId {
    return this.registry.moduleId;
  }
}
