import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { ScopeOptions } from './Container.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';

import { ContextEvents } from '../events/ContextEvents.js';

import { BaseDefinition } from '../definitions/abstract/BaseDefinition.js';

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
  checkoutScope(options?: ScopeOptions): IContainer<TAllowedLifeTime>;

  withScope<TValue>(fn: (locator: IServiceLocator<TAllowedLifeTime>) => TValue): TValue;
  withScope<TValue>(options: ScopeOptions, fn: (locator: IServiceLocator<TAllowedLifeTime>) => TValue): TValue;

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
    UseFn<TAllowedLifeTime> {
  readonly id: string;
  readonly parentId: string | null;
}

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends IServiceLocator<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime> {
  readonly id: string;
  readonly parentId: string | null;
  readonly events: ContextEvents;
}

// prettier-ignore
export type AsyncAllItem<T extends BaseDefinition<Promise<any>, any, any, any>> =
  T extends BaseDefinition<Promise<infer TInstance>, any, any, any> ? TInstance : never;

export type AsyncAllInstances<T extends Array<BaseDefinition<Promise<any>, any, any, any>>> = {
  [K in keyof T]: AsyncAllItem<T[K]>;
};
