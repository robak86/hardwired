import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { InstancesTokens } from '../dsl/new/shared/AddDefinitionBuilder.js';
import type { IDefinitionToken } from '../../definitions/DefinitionToken.js';

import type { IAddDefinitionBuilder } from './IRegisterAware.js';
import type { IDisposeFinalizer } from './IDisposeFinalizer.js';

export type ConfigureResult<TInstance> = TInstance extends Promise<any> ? Promise<void> | void : void;

export interface IConfigureBuilder<TInstance, TLifeTime extends LifeTime> {
  configure<TArgs extends any[]>(
    configureFn: (instance: Awaited<TInstance>, ...args: TArgs) => ConfigureResult<TInstance>,
  ): void;
  configure<TArgs extends any[]>(
    dependencies: InstancesTokens<TArgs, TLifeTime>,
    configureFn: (instance: Awaited<TInstance>, ...args: TArgs) => ConfigureResult<TInstance>,
  ): void;
}

export interface IDecoratedBuilder<TInstance, TLifeTime extends LifeTime> {
  decorate(decorateFn: (instance: Awaited<TInstance>) => TInstance): void;
  decorate<TArgs extends any[]>(
    dependencies: InstancesTokens<TArgs, TLifeTime>,
    decorateFn: (instance: Awaited<TInstance>, ...args: TArgs) => TInstance,
  ): void;
}

export interface IModifyBuilder<TInstance, TLifeTime extends LifeTime>
  extends IAddDefinitionBuilder<TInstance, TLifeTime>,
    IConfigureBuilder<TInstance, TLifeTime>,
    IDecoratedBuilder<TInstance, TLifeTime> {}

export interface ICascadeModifyBuilder<TInstance> extends IModifyBuilder<TInstance, LifeTime.cascading> {
  claimNew(): void;
  inherit(factory: (instance: TInstance) => TInstance): IDisposeFinalizer<TInstance, LifeTime.cascading>;
}

export type ScopeModifyBuilderType<TInstance, TLifeTime extends LifeTime> = TLifeTime extends LifeTime.cascading
  ? ICascadeModifyBuilder<TInstance>
  : IModifyBuilder<TInstance, TLifeTime>;

export interface IScopeModifyAware<TAllowedLifeTime extends LifeTime> {
  modify<TInstance, TLifeTime extends TAllowedLifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): ScopeModifyBuilderType<TInstance, TLifeTime>;
}

export interface IContainerModifyAware<TAllowedLifeTime extends LifeTime> {
  modify<TInstance, TLifeTime extends TAllowedLifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IModifyBuilder<TInstance, TLifeTime>;
}
