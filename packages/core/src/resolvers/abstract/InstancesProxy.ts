import { AbstractDependencyResolver, DependencyResolverEvents } from './AbstractDependencyResolver';
import { ContainerContext } from '../../container/ContainerContext';
import invariant from 'tiny-invariant';
import { InstanceLegacy } from './InstanceLegacy';

export class InstancesProxy {
  private buildFunctions: Record<string, (context: ContainerContext) => any> = {};
  private events: Record<string, DependencyResolverEvents> = {};

  getReference(key: string) {
    // const self = this;

    return new InstanceLegacy(
      (cache: ContainerContext) => {
        const build = this.buildFunctions[key];
        invariant(
          build,
          `Cannot find build implementation for ${key}. Available keys ${Object.keys(this.buildFunctions)}`,
        );
        return build(cache);
      },
      () => {
        const events = this.events[key];

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
