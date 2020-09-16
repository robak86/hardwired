import { createResolverId } from '../utils/fastId';
import { ModuleLookup } from '../module/ModuleLookup';
import { RegistryRecord } from '../module/RegistryRecord';
import { Module } from '../module/Module';
import { ContainerContext } from '../container/ContainerContext';
import { ImmutableSet } from '../collections/ImmutableSet';
import { ModuleId } from '../module/ModuleId';
import { EventsEmitter } from '../utils/EventsEmitter';

export abstract class AbstractDependencyResolver<TReturn> {
  public readonly type: 'dependency' = 'dependency';
  private invalidateEvents: EventsEmitter<any> = new EventsEmitter<any>();

  protected constructor(public readonly id: string = createResolverId()) {}

  notifyInvalidated = this.invalidateEvents.emit;
  onInvalidate = this.invalidateEvents.add;

  onInit?(lookup: ModuleLookup<any>): void;

  abstract build(context: ContainerContext): TReturn;
}

export abstract class AbstractModuleResolver<TReturn extends RegistryRecord> {
  public readonly id: string = createResolverId();
  public readonly type: 'module' = 'module';

  protected constructor(public registry: Module<any>) {}

  abstract build(cache: ContainerContext, injections?: ImmutableSet<any>): ModuleLookup<TReturn>;

  get moduleId(): ModuleId {
    return this.registry.moduleId;
  }
}
