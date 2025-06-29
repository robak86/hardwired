import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../definitions/DefinitionToken.js';
import type { ValidDependenciesLifeTime } from '../../definitions/abstract/InstanceDefinitionDependency.js';
import type { AwaitedInstanceArray } from '../../container/Container.js';

import type { FilterDepsByInstanceType, IAddDefinitionBuilder } from './IRegisterAware.js';
import type { IDisposeFinalizer } from './IDisposeFinalizer.js';

export type ConfigureResult<TInstance> = TInstance extends Promise<any> ? Promise<void> | void : void;

export interface IConfigureBuilder<
  TInstance,
  TLifeTime extends LifeTime,
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
> {
  configure(
    configureFn: (
      instance: Awaited<TInstance>,
      ...deps: AwaitedInstanceArray<TDependencies>
    ) => ConfigureResult<TInstance>,
  ): void;
}

export interface IDecoratedBuilder<
  TInstance,
  TLifeTime extends LifeTime,
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
> {
  decorate(decorateFn: (instance: Awaited<TInstance>, ...deps: AwaitedInstanceArray<TDependencies>) => TInstance): void;
}

export interface IModifyBuilder<
  TInstance,
  TLifeTime extends LifeTime,
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
> extends IAddDefinitionBuilder<TInstance, TLifeTime, TDependencies>,
    IConfigureBuilder<TInstance, TLifeTime, TDependencies>,
    IDecoratedBuilder<TInstance, TLifeTime, TDependencies> {
  using<TDeps extends readonly IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[]>(
    ...deps: FilterDepsByInstanceType<TInstance, TLifeTime, TDeps>
  ): IModifyBuilder<TInstance, TLifeTime, [...TDependencies, ...TDeps]>;
}

export interface ICascadeModifyBuilder<
  TInstance,
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<LifeTime.cascading>>[],
> extends IModifyBuilder<TInstance, LifeTime.cascading, TDependencies> {
  claimNew(): void;
  inherit(
    factory: (instance: TInstance, ...deps: AwaitedInstanceArray<TDependencies>) => TInstance,
  ): IDisposeFinalizer<TInstance, LifeTime.cascading>;
}

export type ScopeModifyBuilderType<TInstance, TLifeTime extends LifeTime> = TLifeTime extends LifeTime.cascading
  ? ICascadeModifyBuilder<TInstance, []>
  : IModifyBuilder<TInstance, TLifeTime, []>;

export interface IScopeModifyAware<TAllowedLifeTime extends LifeTime> {
  modify<TInstance, TLifeTime extends TAllowedLifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): ScopeModifyBuilderType<TInstance, TLifeTime>;
}

export interface IContainerModifyAware<TAllowedLifeTime extends LifeTime> {
  modify<TInstance, TLifeTime extends TAllowedLifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IModifyBuilder<TInstance, TLifeTime, []>;
}
