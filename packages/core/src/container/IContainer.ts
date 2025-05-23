import type { InstancesArray } from '../definitions/abstract/InstanceDefinition.js';
import { type LifeTime } from '../definitions/abstract/LifeTime.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/InstanceDefinitionDependency.js';
import type { ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import type { ContainerConfigureFreezeLifeTimes } from '../configuration/abstract/IContainerConfigurable.js';
import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import type { IDefinitionToken } from '../definitions/def-symbol.js';
import type { MaybePromise } from '../utils/async.js';
import type { ModifyDefinitionBuilder } from '../configuration/dsl/new/shared/ModifyDefinitionBuilder.js';
import type { IConfiguration } from '../configuration/dsl/new/container/ContainerConfiguration.js';
import type { ContainerConfigureFn } from '../configuration/ContainerConfiguration.js';

import type { IInterceptor } from './interceptors/interceptor.js';

export type ScopeTag = string | symbol;

export interface IStrategyAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  readonly id: string;

  // buildWithStrategy<TValue>(
  //   instanceDefinition: IDefinition<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>>,
  // ): MaybePromise<TValue>;
}

export interface IContainerConfigurationAware {
  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    definition: IDefinitionToken<TInstance, TLifeTime>,
  ): ModifyDefinitionBuilder<TInstance, TLifeTime>;
}

export interface ICascadingDefinitionResolver {
  resolveCascading<TValue>(definition: IDefinition<TValue, LifeTime>): MaybePromise<TValue>;
}

export interface IServiceLocator<TAllowedLifeTime extends LifeTime = LifeTime>
  extends IContainerScopes,
    InstanceCreationAware<TAllowedLifeTime> {}

export interface InstanceCreationAware<TAllowedLifeTime extends LifeTime = LifeTime> {
  use<TValue>(
    instanceDefinition: IDefinitionToken<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>>,
  ): MaybePromise<TValue>;

  useAsync<TValue>(
    instanceDefinition: IDefinitionToken<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>>,
  ): Promise<TValue>;

  useExisting<TValue>(
    definition: IDefinitionToken<TValue, LifeTime.scoped | LifeTime.singleton | LifeTime.cascading>,
  ): TValue | null;

  all<TDefinitions extends Array<IDefinitionToken<any, ValidDependenciesLifeTime<TAllowedLifeTime>>>>(
    ...definitions: [...TDefinitions]
  ): MaybePromise<InstancesArray<TDefinitions>>;
}

export interface IContainerScopes {
  scope<TConfigureFns extends Array<ScopeConfigureFn | IConfiguration>>(...configureFns: TConfigureFns): IContainer;
}

export type UseFn<TAllowedLifeTime extends LifeTime> = <TValue>(
  instanceDefinition: IDefinitionToken<TValue, ValidDependenciesLifeTime<TAllowedLifeTime>>,
) => TValue;

export interface IContainer<TAllowedLifeTime extends LifeTime = LifeTime>
  extends InstanceCreationAware<TAllowedLifeTime>,
    IContainerScopes,
    UseFn<TAllowedLifeTime>,
    IContainerConfigurationAware,
    IStrategyAware {
  readonly id: string;
  readonly parentId: string | null;

  dispose(): MaybePromise<void>;

  getInterceptor(id: string | symbol): IInterceptor<any> | undefined;
}

export type IContainerFactory = {
  new: (...configurations: Array<IConfiguration | ContainerConfigureFn>) => IContainer;
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
