import { Instance, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';

import { Definition } from '../definitions/abstract/Definition.js';

import { ScopeConfiguration, ScopeConfigureCallback } from '../configuration/ScopeConfiguration.js';

export interface IStrategyAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  buildWithStrategy<TValue, TArgs extends any[]>(
    instanceDefinition: Definition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, TArgs>,
    ...args: TArgs
  ): TValue;
}

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue, TArgs extends any[]>(
    instanceDefinition: Definition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, TArgs>,
    ...args: TArgs
  ): TValue;

  defer<TInstance, TArgs extends any[]>(
    factoryDefinition: Definition<TInstance, LifeTime.transient, TArgs>,
  ): (...args: TArgs) => TInstance;

  all<TDefinitions extends Array<Definition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, []>>>(
    ...definitions: [...TDefinitions]
  ): HasPromise<InstancesArray<TDefinitions>> extends true
    ? Promise<AwaitedInstanceArray<TDefinitions>>
    : InstancesArray<TDefinitions>;
}

export interface IContainerScopes<TAllowedLifeTime extends LifeTime = LifeTime> {
  checkoutScope(options?: ScopeConfigureCallback | ScopeConfiguration): IContainer<TAllowedLifeTime>;

  withScope<TValue>(fn: (locator: IContainer<TAllowedLifeTime>) => TValue): TValue;
  withScope<TValue>(options: ScopeConfiguration, fn: (locator: IContainer<TAllowedLifeTime>) => TValue): TValue;
}

export interface UseFn<TAllowedLifeTime extends LifeTime> {
  <TValue, TArgs extends any[]>(
    instanceDefinition: Definition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, TArgs>,
    ...args: TArgs
  ): TValue;
}

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends InstanceCreationAware<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime>,
    UseFn<TAllowedLifeTime> {
  readonly id: string;
  readonly parentId: string | null;
}

// prettier-ignore
export type AwaitedInstance<T extends Definition<Promise<any>, any, any>> =
  T extends Definition<Promise<infer TInstance>, any, any> ? TInstance : Instance<T>;

export type AwaitedInstanceArray<T extends Array<Definition<Promise<any>, any, any>>> = {
  [K in keyof T]: AwaitedInstance<T[K]>;
};

export type IsAnyPromise<T> = T extends Promise<any> ? true : false;

// prettier-ignore
export type HasPromise<T extends any[]> =
  T extends [infer First, ...infer Rest] ?
    IsAnyPromise<First> extends true ? true : HasPromise<Rest>:
      false;
