import type {
  AwaitedInstanceRecord,
  Instance,
  InstancesArray,
  InstancesObject,
  InstancesRecord,
} from '../definitions/abstract/InstanceDefinition.js';
import { type LifeTime } from '../definitions/abstract/LifeTime.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/InstanceDefinitionDependency.js';
import type { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import type { HasPromiseMember } from '../utils/HasPromiseMember.js';
import type { ContainerConfigureFreezeLifeTimes } from '../configuration/abstract/ContainerConfigurable.js';
import type { Binder } from '../configuration/Binder.js';
import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import type { CallableDefinition } from '../definitions/CallableDefinition.js';

import type { IInterceptor } from './interceptors/interceptor.js';

export type ScopeTag = string | symbol;

export interface IStrategyAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  readonly id: string;

  buildWithStrategy<TValue, TArgs extends any[]>(
    instanceDefinition: IDefinition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, TArgs>,
    ...args: TArgs
  ): TValue;
}

export interface IContainerConfigurationAware {
  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes, TArgs extends unknown[]>(
    definition: IDefinition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs>;
}

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue>(instanceDefinition: IDefinition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, []>): TValue;

  call<TResult, TArgs extends any[]>(def: CallableDefinition<TArgs, TResult>, ...args: TArgs): TResult;

  useExisting<TValue>(definition: IDefinition<TValue, LifeTime.scoped | LifeTime.singleton, []>): TValue | null;

  defer<TInstance, TArgs extends any[]>(
    factoryDefinition: IDefinition<TInstance, LifeTime.transient, TArgs>,
  ): (...args: TArgs) => TInstance;

  all<TDefinitions extends Array<IDefinition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, []>>>(
    ...definitions: [...TDefinitions]
  ): ContainerAllReturn<TDefinitions>;

  object<TRecord extends Record<PropertyKey, IDefinition<any, any, []>>>(
    object: TRecord,
  ): HasPromiseMember<InstancesObject<TRecord>[keyof InstancesObject<TRecord>]> extends true
    ? Promise<AwaitedInstanceRecord<TRecord>>
    : InstancesRecord<TRecord>;
}

export type NewScopeReturnType<
  TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>,
  TAllowedLifeTime extends LifeTime = LifeTime,
> =
  HasPromise<ReturnTypes<TConfigureFns>> extends true
    ? Promise<IContainer<TAllowedLifeTime>>
    : IContainer<TAllowedLifeTime>;

export type ApplyReturnType<TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>> =
  HasPromise<ReturnTypes<TConfigureFns>> extends true ? Promise<void> : void;

export type ContainerAllReturn<TDefinitions extends Array<IDefinition<any, ValidDependenciesLifeTime<LifeTime>, []>>> =
  HasPromise<InstancesArray<TDefinitions>> extends true
    ? Promise<AwaitedInstanceArray<TDefinitions>>
    : InstancesArray<TDefinitions>;

export interface IContainerScopes {
  scope<TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>>(
    ...configureFns: TConfigureFns
  ): NewScopeReturnType<TConfigureFns>;
}

export type UseFn<TAllowedLifeTime extends LifeTime> = <TValue>(
  instanceDefinition: IDefinition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, []>,
) => TValue;

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends InstanceCreationAware<TAllowedLifeTime>,
    IContainerScopes,
    UseFn<TAllowedLifeTime>,
    IContainerConfigurationAware {
  readonly id: string;
  readonly parentId: string | null;

  dispose(): void;

  getInterceptor(id: string | symbol): IInterceptor<any> | undefined;
}

// prettier-ignore
export type AwaitedInstance<T extends IDefinition<Promise<any>, any, any>> =
  T extends IDefinition<Promise<infer TInstance>, any, any> ? TInstance : Instance<T>;

export type AwaitedInstanceArray<T extends Array<IDefinition<Promise<any>, any, any>>> = {
  [K in keyof T]: AwaitedInstance<T[K]>;
};

export type IsAnyPromise<T> = T extends Promise<any> ? true : false;

export type NextValue<TPrev, TNext> = IsAnyPromise<TPrev> extends true ? Promise<TNext> : TNext;

export type ReturnTypes<T extends any[]> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? ReturnType<T[K]> : never;
};

// prettier-ignore
export type HasPromise<T extends any[]> =
  T extends [infer First, ...infer Rest] ?
    IsAnyPromise<First> extends true ? true : HasPromise<Rest>:
      false;

export type ContainerObjectReturn<TRecord extends Record<PropertyKey, IDefinition<any, any, any>>> =
  HasPromiseMember<InstancesObject<TRecord>[keyof InstancesObject<TRecord>]> extends true
    ? Promise<AwaitedInstanceRecord<TRecord>>
    : InstancesRecord<TRecord>;
