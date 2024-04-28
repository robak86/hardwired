import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';

import { ContainerScopeOptions } from './Container.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';

import { ContextEvents } from '../events/ContextEvents.js';

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue, TExternals>(instanceDefinition: InstanceDefinition<TValue, any, any>): TValue;
  use<TValue, TExternals>(instanceDefinition: InstanceDefinition<Promise<TValue>, any, any>): Promise<TValue>;
  use<TValue, TExternals>(
    instanceDefinition: InstanceDefinition<Promise<TValue> | TValue, any, any>,
  ): Promise<TValue> | TValue;

  getAll<TDefinitions extends InstanceDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, any>[]>(
    definitions: [...TDefinitions],
  ): InstancesArray<TDefinitions>;
}

export interface IContainerScopes<TAllowedLifeTime extends LifeTime = LifeTime> {
  checkoutScope(options?: ContainerScopeOptions): IContainer<TAllowedLifeTime>;
  withScope<TValue>(fn: (locator: IContainer<TAllowedLifeTime>) => TValue): TValue;
  override(definition: InstanceDefinition<any, any, any>): void;
  provide<T>(def: InstanceDefinition<T, LifeTime.scoped, any>, instance: T): void;
  dispose(): void; // runs dispose method on every scoped/request instance created within this scope?
  // but what about singletons that were already propagated to parent scope?
}

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends InstanceCreationAware<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime> {
  readonly id: string;
  readonly parentId: string | null;
  readonly events: ContextEvents;
}
