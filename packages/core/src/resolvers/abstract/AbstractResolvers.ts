import { ContainerContext } from '../../container/ContainerContext';
import { createResolverId } from '../../utils/fastId';
import { Thunk } from '../../utils/Thunk';
import { DependencyResolverEvents } from './DependencyResolverEvents';
import { ContainerEvents } from '../../container/ContainerEvents';
import { AnyResolver } from './Module';

export type BoundResolver = {
  resolverThunk: Thunk<AnyResolver>;
  dependencies: (string | Record<string, string>)[];
};

export namespace Instance {
  export type Unbox<T> = T extends Instance<infer TInstance, any>
    ? TInstance
    : 'cannot unwrap instance type from Instance';
}

export abstract class Instance<TValue, TDeps extends any[]> {
  kind: 'instanceResolver' = 'instanceResolver';
  public readonly events = new DependencyResolverEvents();

  protected constructor(public readonly id: string = createResolverId()) {}

  abstract build(context: ContainerContext, deps: TDeps): TValue;

  onInit?(containerEvents: ContainerEvents): void;
}
