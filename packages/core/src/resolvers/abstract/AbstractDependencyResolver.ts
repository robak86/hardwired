import { createResolverId } from "../../utils/fastId";
import { ModuleLookup } from "../../module/ModuleLookup";
import { ContainerContext } from "../../container/ContainerContext";
import { EventsEmitter } from "../../utils/EventsEmitter";

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

