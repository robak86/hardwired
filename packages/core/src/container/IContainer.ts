import type { AwaitedInstanceRecord, Instance, InstancesArray } from '../definitions/abstract/InstanceDefinition.js';
import { type LifeTime } from '../definitions/abstract/LifeTime.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/InstanceDefinitionDependency.js';
import type { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import type { ContainerConfigureFreezeLifeTimes } from '../configuration/abstract/ContainerConfigurable.js';
import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import type { IDefinitionSymbol } from '../definitions/def-symbol.js';
import type { MaybePromise } from '../utils/async.js';
import type { OverridesConfigBuilder } from '../configuration/dsl/new/shared/OverridesConfigBuilder.js';

import type { IInterceptor } from './interceptors/interceptor.js';

export type ScopeTag = string | symbol;

export interface IStrategyAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  readonly id: string;

  buildWithStrategy<TValue>(
    instanceDefinition: IDefinition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>>,
  ): MaybePromise<TValue>;
}

export interface IContainerConfigurationAware {
  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    definition: IDefinitionSymbol<TInstance, TLifeTime>,
  ): OverridesConfigBuilder<TInstance, TLifeTime>;
}

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue>(
    instanceDefinition: IDefinitionSymbol<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>>,
  ): MaybePromise<TValue>;

  useAsync<TValue>(
    instanceDefinition: IDefinitionSymbol<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>>,
  ): Promise<TValue>;

  useExisting<TValue>(
    definition: IDefinitionSymbol<TValue, LifeTime.scoped | LifeTime.singleton | LifeTime.cascading>,
  ): TValue | null;

  all<TDefinitions extends Array<IDefinitionSymbol<any, ValidDependenciesLifeTime<TAllowedLifeTime>>>>(
    ...definitions: [...TDefinitions]
  ): MaybePromise<InstancesArray<TDefinitions>>;

  // object<TRecord extends Record<PropertyKey, IDefinition<any, any>>>(
  //   object: TRecord,
  // ): HasPromiseMember<InstancesObject<TRecord>[keyof InstancesObject<TRecord>]> extends true
  //   ? Promise<AwaitedInstanceRecord<TRecord>>
  //   : InstancesRecord<TRecord>;
}

export type NewScopeReturnType<
  TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>,
  TAllowedLifeTime extends LifeTime = LifeTime,
> =
  HasPromise<ReturnTypes<TConfigureFns>> extends true
    ? Promise<IContainer<TAllowedLifeTime>>
    : IContainer<TAllowedLifeTime>;

export interface IContainerScopes {
  scope<TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>>(
    ...configureFns: TConfigureFns
  ): NewScopeReturnType<TConfigureFns>;
}

export type UseFn<TAllowedLifeTime extends LifeTime> = <TValue>(
  instanceDefinition: IDefinitionSymbol<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>>,
) => TValue;

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends InstanceCreationAware<TAllowedLifeTime>,
    IContainerScopes,
    UseFn<TAllowedLifeTime>,
    IContainerConfigurationAware,
    IStrategyAware {
  readonly id: string;
  readonly parentId: string | null;

  dispose(): void;

  getInterceptor(id: string | symbol): IInterceptor<any> | undefined;
}

// prettier-ignore
export type AwaitedInstance<T extends IDefinitionSymbol<Promise<any>, any>> =
  T extends IDefinitionSymbol<Promise<infer TInstance>, any> ? TInstance : Instance<T>;

export type AwaitedInstanceArray<T extends Array<IDefinition<Promise<any>, any>>> = {
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

export type ContainerObjectReturn<TRecord extends Record<PropertyKey, IDefinition<any, any>>> = Promise<
  AwaitedInstanceRecord<TRecord>
>;
