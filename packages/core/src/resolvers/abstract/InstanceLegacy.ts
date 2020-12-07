import { ContainerContext } from '../../container/ContainerContext';
import { DependencyResolverEvents } from "./DependencyResolverEvents";

let id = 1;

// TODO: rename -> Instance|Definition|Def (the shorter the better for types errors messages?)
export class InstanceLegacy<T> {
  private id = (id += 1);

  constructor(public get: (context: ContainerContext) => T, private getEvents: () => DependencyResolverEvents) {}

  get events(): DependencyResolverEvents {
    return this.getEvents();
  }
}
