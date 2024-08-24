import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { ContainerScopeOptions } from './Container.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { ContextEvents } from '../events/ContextEvents.js';
import { BaseFnDefinition } from '../definitions/abstract/FnDefinition.js';

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue>(instanceDefinition: InstanceDefinition<TValue, any, any>): TValue;
  use<TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any, any>): Promise<TValue>;
  use<TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any, any>): Promise<TValue> | TValue;

  useAll<TDefinitions extends InstanceDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, any>[]>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions>;
}

export interface IContainerScopes<TAllowedLifeTime extends LifeTime = LifeTime> {
  checkoutScope(options?: Omit<ContainerScopeOptions, 'globalOverrides'>): IContainer<TAllowedLifeTime>;
  withScope<TValue>(fn: (locator: IServiceLocator<TAllowedLifeTime>) => TValue): TValue;
  override(definition: AnyInstanceDefinition<any, any, any>): void;
  provide<T>(def: AnyInstanceDefinition<T, LifeTime.scoped, any>, instance: T): void;
}

export interface IServiceLocator<TAllowedLifeTime extends LifeTime = LifeTime>
  extends InstanceCreationAware<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime> {}

export interface FnServiceLocator {
  <TValue>(instanceDefinition: BaseFnDefinition<TValue, any, any>): TValue;
}

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends IServiceLocator<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime> {
  readonly id: string;
  readonly parentId: string | null;
  readonly events: ContextEvents;
}
