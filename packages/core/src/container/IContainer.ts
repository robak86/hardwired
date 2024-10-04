import { Instance, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';

import { Definition } from '../definitions/abstract/Definition.js';

import { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';

export type EnsurePromise<T> = T extends Promise<any> ? T : Promise<T>;

export interface IStrategyAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  readonly id: string;

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

export type ContainerRunFn<TAllowedLifeTime extends LifeTime, TValue> = (
  locator: IContainer<TAllowedLifeTime>,
) => TValue;

export interface IContainerScopes<TAllowedLifeTime extends LifeTime = LifeTime> {
  checkoutScope(): IContainer<TAllowedLifeTime>;
  checkoutScope(options: AsyncScopeConfigureFn): Promise<IContainer<TAllowedLifeTime>>;
  checkoutScope(options?: ScopeConfigureFn): IContainer<TAllowedLifeTime>;

  withScope<TValue>(fn: ContainerRunFn<LifeTime, TValue>): TValue;
  withScope<TValue>(options: AsyncScopeConfigureFn, fn: ContainerRunFn<LifeTime, TValue>): EnsurePromise<TValue>;
  withScope<TValue>(options: ScopeConfigureFn, fn: ContainerRunFn<LifeTime, TValue>): TValue;
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
    UseFn<TAllowedLifeTime>,
    Disposable {
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
