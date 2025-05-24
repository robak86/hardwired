import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../definitions/def-symbol.js';
import type { MaybePromise } from '../../utils/async.js';
import type { ConstructorArgsSymbols } from '../dsl/new/shared/AddDefinitionBuilder.js';

import type { IAddDefinitionBuilder } from './IRegisterAware.js';

export interface IConfigureBuilder<TInstance, TLifeTime extends LifeTime> {
  configure<TArgs extends any[]>(configureFn: (instance: TInstance, ...args: TArgs) => MaybePromise<void>): void;
  configure<TArgs extends any[]>(
    dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>,
    configureFn: (instance: TInstance, ...args: TArgs) => MaybePromise<void>,
  ): void;
}

export interface IModifyBuilder<TInstance, TLifeTime extends LifeTime>
  extends IAddDefinitionBuilder<TInstance, TLifeTime>,
    IConfigureBuilder<TInstance, TLifeTime> {
  decorate<TArgs extends any[]>(decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>): void;
  decorate<TArgs extends any[]>(
    dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>,
    decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
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
