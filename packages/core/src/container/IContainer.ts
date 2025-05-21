import type { InstancesArray } from '../definitions/abstract/InstanceDefinition.js';
import { type LifeTime } from '../definitions/abstract/LifeTime.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/InstanceDefinitionDependency.js';
import type { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import type { ContainerConfigureFreezeLifeTimes } from '../configuration/abstract/IContainerConfigurable.js';
import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import type { IDefinitionSymbol } from '../definitions/def-symbol.js';
import type { MaybePromise } from '../utils/async.js';
import type { ModifyDefinitionBuilder } from '../configuration/dsl/new/shared/ModifyDefinitionBuilder.js';

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
  ): ModifyDefinitionBuilder<TInstance, TLifeTime>;
}

export interface IServiceLocator<TAllowedLifeTime extends LifeTime = LifeTime>
  extends IContainerScopes,
    InstanceCreationAware<TAllowedLifeTime> {}

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

export type IsAnyPromise<T> = T extends Promise<any> ? true : false;

export type ReturnTypes<T extends any[]> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? ReturnType<T[K]> : never;
};

// prettier-ignore
export type HasPromise<T extends any[]> =
  T extends [infer First, ...infer Rest] ?
    IsAnyPromise<First> extends true ? true : HasPromise<Rest>:
      false;
