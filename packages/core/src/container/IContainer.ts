import type {
  AwaitedInstanceRecord,
  Instance,
  InstancesArray,
  InstancesObject,
  InstancesRecord,
} from '../definitions/abstract/InstanceDefinition.js';
import { type LifeTime } from '../definitions/abstract/LifeTime.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/InstanceDefinitionDependency.js';
import type { Definition } from '../definitions/impl/Definition.js';
import type { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import type { HasPromiseMember } from '../utils/HasPromiseMember.js';
import type { ContainerConfigureFreezeLifeTimes } from '../configuration/abstract/ContainerConfigurable.js';
import type { Binder } from '../configuration/Binder.js';

import type { IInterceptor } from './interceptors/interceptor.js';

export type ScopeTag = string | symbol;

export interface IStrategyAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  readonly id: string;

  buildWithStrategy<TValue, TArgs extends any[]>(
    instanceDefinition: Definition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, TArgs>,
    ...args: TArgs
  ): TValue;
}

export interface IContainerConfigurationAware {
  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes, TArgs extends unknown[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs>;
}

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue>(instanceDefinition: Definition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, []>): TValue;

  call<TValue, TArgs extends any[]>(
    instanceDefinition: Definition<TValue, LifeTime.transient, TArgs>,
    ...args: TArgs
  ): TValue;

  useExisting<TValue>(definition: Definition<TValue, LifeTime.scoped | LifeTime.singleton, []>): TValue | null;

  defer<TInstance, TArgs extends any[]>(
    factoryDefinition: Definition<TInstance, LifeTime.transient, TArgs>,
  ): (...args: TArgs) => TInstance;

  all<TDefinitions extends Array<Definition<any, ValidDependenciesLifeTime<TAllowedLifeTime>, []>>>(
    ...definitions: [...TDefinitions]
  ): ContainerAllReturn<TDefinitions>;

  object<TRecord extends Record<PropertyKey, Definition<any, any, any>>>(
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

export type ContainerAllReturn<TDefinitions extends Array<Definition<any, ValidDependenciesLifeTime<LifeTime>, []>>> =
  HasPromise<InstancesArray<TDefinitions>> extends true
    ? Promise<AwaitedInstanceArray<TDefinitions>>
    : InstancesArray<TDefinitions>;

export interface IContainerScopes {
  scope<TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>>(
    ...configureFns: TConfigureFns
  ): NewScopeReturnType<TConfigureFns>;
}

export type UseFn<TAllowedLifeTime extends LifeTime> = <TValue>(
  instanceDefinition: Definition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>, []>,
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
