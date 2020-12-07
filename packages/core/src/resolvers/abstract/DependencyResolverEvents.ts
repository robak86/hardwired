import { EventsEmitter } from "../../utils/EventsEmitter";

export class DependencyResolverEvents {
  invalidateEvents: EventsEmitter<any> = new EventsEmitter<any>();
}
