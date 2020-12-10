import { EventsEmitter } from "../utils/EventsEmitter";

export class InstanceEvents {
  invalidateEvents: EventsEmitter<any> = new EventsEmitter<any>();
}
