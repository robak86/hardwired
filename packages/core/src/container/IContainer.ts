import type {
  AwaitedInstanceRecord,
  Instance,
  InstancesArray,
  InstancesObject,
  InstancesRecord,
} from '../definitions/abstract/sync/InstanceDefinition.js';
import { type LifeTime } from '../definitions/abstract/LifeTime.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import type { Definition } from '../definitions/abstract/Definition.js';
import type { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import type {
  DisposableAsyncScopeConfigureFn,
  DisposableScopeConfigureFn,
} from '../configuration/DisposableScopeConfiguration.js';
import type { HasPromiseMember } from '../utils/HasPromiseMember.js';

import type { DisposableScope } from './DisposableScope.js';
import type { IInterceptor } from './interceptors/interceptor.js';

export type EnsurePromise<T> = T extends Promise<any> ? T : Promise<T>;

export type ScopeTag = string | symbol;

export interface IStrategyAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  readonly id: string;

  buildWithStrategy<TValue, TArgs extends any[]>(
    instanceDefinition: Definition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, TArgs>,
    ...args: TArgs
  ): TValue;
}

export interface IDisposableScopeAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  disposable(): DisposableScope;
  disposable(options: DisposableAsyncScopeConfigureFn): Promise<DisposableScope>;
  disposable(options?: DisposableScopeConfigureFn): DisposableScope;
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

  object<TRecord extends Record<PropertyKey, Definition<any, any, any>>>(
    object: TRecord,
  ): HasPromiseMember<InstancesObject<TRecord>[keyof InstancesObject<TRecord>]> extends true
    ? Promise<AwaitedInstanceRecord<TRecord>>
    : InstancesRecord<TRecord>;
}

export type ContainerRunFn<TAllowedLifeTime extends LifeTime, TValue> = (
  locator: IContainer<TAllowedLifeTime>,
) => TValue;

export type NewScopeReturnType<
  TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>,
  TAllowedLifeTime extends LifeTime = LifeTime,
> =
  HasPromise<ReturnTypes<TConfigureFns>> extends true
    ? Promise<IContainer<TAllowedLifeTime>>
    : IContainer<TAllowedLifeTime>;

export type ContainerAllReturn<TDefinitions extends Array<Definition<any, ValidDependenciesLifeTime<LifeTime>, []>>> =
  HasPromise<InstancesArray<TDefinitions>> extends true
    ? Promise<AwaitedInstanceArray<TDefinitions>>
    : InstancesArray<TDefinitions>;

export interface IContainerScopes<TAllowedLifeTime extends LifeTime = LifeTime> {
  scope<TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>>(
    ...configureFns: TConfigureFns
  ): NewScopeReturnType<TConfigureFns, TAllowedLifeTime>;

  withScope<TValue>(fn: ContainerRunFn<LifeTime, TValue>): TValue;
  withScope<TValue>(options: AsyncScopeConfigureFn, fn: ContainerRunFn<LifeTime, TValue>): EnsurePromise<TValue>;
  withScope<TValue>(options: ScopeConfigureFn, fn: ContainerRunFn<LifeTime, TValue>): TValue;
}

export type UseFn<TAllowedLifeTime extends LifeTime> = <TValue, TArgs extends any[]>(
  instanceDefinition: Definition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, TArgs>,
  ...args: TArgs
) => TValue;

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends InstanceCreationAware<TAllowedLifeTime>,
    IContainerScopes<TAllowedLifeTime>,
    UseFn<TAllowedLifeTime>,
    IDisposableScopeAware<TAllowedLifeTime> {
  readonly id: string;
  readonly parentId: string | null;

  getInterceptor(id: string | symbol): IInterceptor<any> | undefined;
}

// prettier-ignore
export type AwaitedInstance<T extends Definition<Promise<any>, any, any>> =
  T extends Definition<Promise<infer TInstance>, any, any> ? TInstance : Instance<T>;

export type AwaitedInstanceArray<T extends Array<Definition<Promise<any>, any, any>>> = {
  [K in keyof T]: AwaitedInstance<T[K]>;
};

export type IsAnyPromise<T> = T extends Promise<any> ? true : false;

export type ReturnTypes<T extends any[]> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? ReturnType<T[K]> : never;
};

// prettier-ignore
export type HasPromise<T extends any[]> =
  T extends [infer First, ...infer Rest] ?
    IsAnyPromise<First> extends true ? true : HasPromise<Rest>:
      false;

export type ContainerObjectReturn<TRecord extends Record<PropertyKey, Definition<any, any, any>>> =
  HasPromiseMember<InstancesObject<TRecord>[keyof InstancesObject<TRecord>]> extends true
    ? Promise<AwaitedInstanceRecord<TRecord>>
    : InstancesRecord<TRecord>;
