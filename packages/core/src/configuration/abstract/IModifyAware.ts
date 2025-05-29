import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../definitions/tokens.js';
import type { MaybePromise } from '../../utils/async.js';
import type { ConstructorArgsTokens } from '../dsl/new/shared/AddDefinitionBuilder.js';

import type { IAddDefinitionBuilder } from './IRegisterAware.js';

export type ConfigureResult<TInstance> = TInstance extends Promise<any> ? Promise<void> | void : void;

export interface IConfigureBuilder<TInstance, TLifeTime extends LifeTime> {
  configure<TArgs extends any[]>(
    configureFn: (instance: Awaited<TInstance>, ...args: TArgs) => ConfigureResult<TInstance>,
  ): void;
  configure<TArgs extends any[]>(
    dependencies: ConstructorArgsTokens<TArgs, TLifeTime>,
    configureFn: (instance: Awaited<TInstance>, ...args: TArgs) => ConfigureResult<TInstance>,
  ): void;
}

export interface IModifyBuilder<TInstance, TLifeTime extends LifeTime>
  extends IAddDefinitionBuilder<TInstance, TLifeTime>,
    IConfigureBuilder<TInstance, TLifeTime> {
  decorate(decorateFn: (instance: Awaited<TInstance>) => TInstance): void;
  decorate<TArgs extends any[]>(
    dependencies: ConstructorArgsTokens<TArgs, TLifeTime>,
    decorateFn: (instance: Awaited<TInstance>, ...args: TArgs) => TInstance,
  ): void;
}

export interface ICascadeModifyBuilder<TInstance> extends IModifyBuilder<TInstance, LifeTime.cascading> {
  claimNew(): void;
  inherit(factory: (instance: TInstance) => MaybePromise<TInstance>): void;
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
