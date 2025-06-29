import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { InstancesTokens } from '../dsl/new/shared/AddDefinitionBuilder.js';
import type { ClassType } from '../../definitions/utils/class-type.js';
import type { IServiceLocator } from '../../container/IContainer.js';
import type { IDefinitionToken } from '../../definitions/DefinitionToken.js';
import type { ValidDependenciesLifeTime } from '../../definitions/abstract/InstanceDefinitionDependency.js';

import type { FinalizerOrVoid } from './IDisposeFinalizer.js';

export type AwaitedArray<T extends any[]> = {
  [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K];
};

export type AllowedDependencyFor<TInstance, TLifetime extends LifeTime, T> =
  TInstance extends Promise<any>
    ? T extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifetime>>
      ? T
      : never
    : T extends IDefinitionToken<infer R, ValidDependenciesLifeTime<TLifetime>>
      ? R extends Promise<any>
        ? never
        : T
      : never;

export type FilterDepsByInstanceType<TInstance, TLifetime extends LifeTime, TDeps extends readonly any[]> = {
  [K in keyof TDeps]: AllowedDependencyFor<TInstance, TLifetime, TDeps[K]>;
};

export interface IAddDefinitionBuilder<
  TInstance,
  TLifetime extends LifeTime,
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifetime>>[],
> {
  class<TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...dependencies: InstancesTokens<TConstructorArgs, TLifetime>
  ): FinalizerOrVoid<TInstance, TLifetime>;

  fn<TArgs extends any[]>(
    fn: (...args: AwaitedArray<TArgs>) => TInstance,
    ...dependencies: InstancesTokens<TArgs, TLifetime>
  ): FinalizerOrVoid<TInstance, TLifetime>;

  static(value: TInstance): FinalizerOrVoid<TInstance, TLifetime>;

  locator(fn: (container: IServiceLocator) => TInstance): FinalizerOrVoid<TInstance, TLifetime>;

  asyncLocator(fn: (container: IServiceLocator) => Promise<TInstance>): FinalizerOrVoid<TInstance, TLifetime>;

  using<TDeps extends readonly IDefinitionToken<any, ValidDependenciesLifeTime<TLifetime>>[]>(
    ...deps: FilterDepsByInstanceType<TInstance, TLifetime, TDeps>
  ): IAddDefinitionBuilder<TInstance, TLifetime, [...TDependencies, ...TDeps]>;
}

// TODO: IRegisterAware should not accept IDefinition (which extends IDefinitionToken) as a parameter
export interface IRegisterAware<TAllowedLifeTime extends LifeTime> {
  add<TInstance, TLifeTime extends TAllowedLifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IAddDefinitionBuilder<TInstance, TLifeTime, []>;
}
