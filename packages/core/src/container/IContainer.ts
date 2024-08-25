import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { ContainerScopeOptions } from './Container.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { ContextEvents } from '../events/ContextEvents.js';
import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';
import { Patch } from './Patch.js';

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue>(instanceDefinition: InstanceDefinition<TValue, any, any>): TValue;
  use<TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any, any>): Promise<TValue>;
  use<TValue>(instanceDefinition: BaseDefinition<TValue, any, any, any>): TValue;
  use<TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any, any>): Promise<TValue> | TValue;

  all<
    TDefinitions extends Array<
      | InstanceDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, any>
      | BaseDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, any, any>
    >,
  >(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions>;
}

export interface IContainerScopes<TAllowedLifeTime extends LifeTime = LifeTime> {
  // TODO: not sure if this should be public
  checkoutScope(options?: Omit<ContainerScopeOptions, 'globalOverrides'>): IContainer<TAllowedLifeTime>;

  withScope<TValue>(fn: (locator: IServiceLocator<TAllowedLifeTime>) => TValue): TValue;
  withScope<TValue>(overrides: Patch, fn: (locator: IServiceLocator<TAllowedLifeTime>) => TValue): TValue;

  override(definition: AnyInstanceDefinition<any, any, any>): void;
  provide<T>(def: AnyInstanceDefinition<T, LifeTime.scoped, any>, instance: T): void;
}

export interface UseFn {
  <TValue>(instanceDefinition: InstanceDefinition<TValue, any, []>): TValue;
  <TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any, []>): Promise<TValue>;
  <TValue, TArgs extends any[]>(
    instanceDefinition: BaseDefinition<TValue, LifeTime, any, TArgs>,
    ...args: TArgs
  ): TValue;
  <TValue, TArgs extends []>(instanceDefinition: AnyInstanceDefinition<TValue, any, any>, ...args: TArgs): TValue;
}

export interface IServiceLocator<TAllowedLifeTime extends LifeTime = LifeTime>
  extends InstanceCreationAware<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime>,
    UseFn {}

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends IServiceLocator<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime> {
  readonly id: string;
  readonly parentId: string | null;
  readonly events: ContextEvents;
}
