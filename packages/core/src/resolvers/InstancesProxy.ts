import { AbstractDependencyResolver, DependencyResolverEvents } from "./abstract/AbstractDependencyResolver";
import { DependencyFactory } from "../module/RegistryRecord";
import { ContainerContext } from "../container/ContainerContext";
import invariant from "tiny-invariant";

export class InstancesProxy {
  private buildFunctions: Record<string, (context: ContainerContext) => any> = {};
  private events: Record<string, DependencyResolverEvents> = {};

  getReference(key: string) {
    const self = this;

    return new DependencyFactory(
      (cache: ContainerContext) => {
        const build = self.buildFunctions[key];
        invariant(
          build,
          `Cannot find build implementation for ${key}. Available keys ${Object.keys(this.buildFunctions)}`,
        );
        return build(cache);
      },
      () => {
        const events = self.events[key];

        invariant(events, 'notifyInvalidated called before modules initialization complete');
        return events;
      },
    );
  }

  replaceImplementation(key, resolver: AbstractDependencyResolver<any>) {
    this.buildFunctions[key] = resolver.build.bind(resolver);
    this.events[key] = resolver.events;
  }
}
