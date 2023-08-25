import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { ContainerScopeOptions } from './Container.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { ContextEvents } from '../events/ContextEvents.js';

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  get<TValue, TExternals>(instanceDefinition: InstanceDefinition<TValue, any>): TValue;
  get<TValue, TExternals>(instanceDefinition: AsyncInstanceDefinition<TValue, any>): Promise<TValue>;
  get<TValue, TExternals>(instanceDefinition: AnyInstanceDefinition<TValue, any>): Promise<TValue> | TValue;

  getAll<TDefinitions extends InstanceDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>>[]>(
    definitions: [...TDefinitions],
  ): InstancesArray<TDefinitions>;
}

export interface IContainerScopes<TAllowedLifeTime extends LifeTime = LifeTime> {
  checkoutScope(options?: ContainerScopeOptions): IContainer<TAllowedLifeTime>;
  withScope<TValue>(fn: (locator: IContainer<TAllowedLifeTime>) => TValue): TValue;
  override(definition: AnyInstanceDefinition<any, any>): void;
  provide<T>(def: AnyInstanceDefinition<T, LifeTime.scoped>, instance: T): void;
  provideAsync<T>(def: AnyInstanceDefinition<T, LifeTime.scoped>, instance: () => Promise<T>): void;
  dispose(): void; // runs dispose method on every scoped/request instance created within this scope?
  // but what about singletons that were already propagated to parent scope?
}

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends InstanceCreationAware<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime> {
  readonly id: string;
  readonly events: ContextEvents;
}
