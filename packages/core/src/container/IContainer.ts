import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { ContainerScopeOptions } from './Container.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';

import { ContextEvents } from '../events/ContextEvents.js';
import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';
import { Patch } from './Patch.js';

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue, TArgs extends any[]>(
    instanceDefinition: BaseDefinition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, any, TArgs>,
    ...args: TArgs
  ): TValue;

  all<TDefinitions extends Array<BaseDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, any, any>>>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions>;
}

export interface IContainerScopes<TAllowedLifeTime extends LifeTime = LifeTime> {
  // TODO: not sure if this should be public
  checkoutScope(options?: Omit<ContainerScopeOptions, 'globalOverrides'>): IContainer<TAllowedLifeTime>;

  withScope<TValue>(fn: (locator: IServiceLocator<TAllowedLifeTime>) => TValue): TValue;
  withScope<TValue>(overrides: Patch, fn: (locator: IServiceLocator<TAllowedLifeTime>) => TValue): TValue;

  override(definition: BaseDefinition<any, any, any, any>): void;
  provide<T>(def: BaseDefinition<T, LifeTime.scoped, any, any>, instance: T): void;
}

export interface UseFn<TAllowedLifeTime extends LifeTime = LifeTime> {
  <TValue, TArgs extends any[]>(
    instanceDefinition: BaseDefinition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, any, TArgs>,
    ...args: TArgs
  ): TValue;
}

export interface IServiceLocator<TAllowedLifeTime extends LifeTime = LifeTime>
  extends InstanceCreationAware<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime>,
    UseFn<TAllowedLifeTime> {}

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends IServiceLocator<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime> {
  readonly id: string;
  readonly parentId: string | null;
  readonly events: ContextEvents;
}
