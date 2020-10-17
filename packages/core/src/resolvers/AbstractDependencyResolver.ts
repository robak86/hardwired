import { createResolverId } from "../utils/fastId";
import { ModuleLookup } from "../module/ModuleLookup";
import { RegistryRecord } from "../module/RegistryRecord";
import { Module } from "../module/Module";
import { ContainerContext } from "../container/ContainerContext";
import { ImmutableSet } from "../collections/ImmutableSet";
import { ModuleId } from "../module/ModuleId";
import { EventsEmitter } from "../utils/EventsEmitter";

export class DependencyResolverEvents {
  invalidateEvents: EventsEmitter<any> = new EventsEmitter<any>();
}

export abstract class AbstractDependencyResolver<TReturn> {
  public readonly type: 'dependency' = 'dependency';
  public readonly events = new DependencyResolverEvents();

  protected constructor(public readonly id: string = createResolverId()) {}

  onInit?(lookup: ModuleLookup<any>): void;
  onAppend?(lookup: ModuleLookup<any>): void;

  abstract build(context: ContainerContext): TReturn;
}

export abstract class AbstractModuleResolver<TReturn extends RegistryRecord> {
  public readonly id: string = createResolverId();
  public readonly type: 'module' = 'module';

  private keepType!: TReturn; // We need to fake that TReturn is used by class, otherwise type is generalized to RegistryRecord

  protected constructor(public module: Module<any>) {}

  abstract load(cache: ContainerContext, injections?: ImmutableSet<any>);

  get moduleId(): ModuleId {
    return this.module.moduleId;
  }

  abstract onInit(containerContext: ContainerContext): void;
}
