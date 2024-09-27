import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { ScopeOptions } from './Container.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';

import { ContextEvents } from '../events/ContextEvents.js';

import { Definition } from '../definitions/abstract/Definition.js';
import {
  ContainerConfiguration,
  ContainerConfigureCallback,
  ScopeConfiguration,
  ScopeConfigureCallback,
} from './ContainerConfiguration.js';

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue, TArgs extends any[]>(
    instanceDefinition: Definition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, TArgs>,
    ...args: TArgs
  ): TValue;

  all<TDefinitions extends Array<Definition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, []>>>(
    ...definitions: [...TDefinitions]
  ): TDefinitions extends Array<Definition<Promise<any>, any, []>>
    ? Promise<AsyncAllInstances<TDefinitions>>
    : InstancesArray<TDefinitions>;
}

export interface IContainerScopes<TAllowedLifeTime extends LifeTime = LifeTime> {
  // TODO: not sure if this should be public
  checkoutScope(options?: ScopeOptions | ScopeConfigureCallback | ScopeConfiguration): IContainer<TAllowedLifeTime>;

  withScope<TValue>(fn: (locator: IServiceLocator<TAllowedLifeTime>) => TValue): TValue;
  withScope<TValue>(options: ScopeOptions, fn: (locator: IServiceLocator<TAllowedLifeTime>) => TValue): TValue;
}

export interface UseFn<TAllowedLifeTime extends LifeTime> {
  <TValue, TArgs extends any[]>(
    instanceDefinition: Definition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, TArgs>,
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
export type AsyncAllItem<T extends Definition<Promise<any>, any, any>> =
  T extends Definition<Promise<infer TInstance>, any, any> ? TInstance : never;

export type AsyncAllInstances<T extends Array<Definition<Promise<any>, any, any>>> = {
  [K in keyof T]: AsyncAllItem<T[K]>;
};
