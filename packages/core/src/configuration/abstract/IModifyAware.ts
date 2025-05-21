import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionSymbol } from '../../definitions/def-symbol.js';
import type { MaybePromise } from '../../utils/async.js';
import type { ConstructorArgsSymbols } from '../dsl/new/shared/SymbolsRegistrationBuilder.js';

import type { IRegistrationBuilder } from './IRegisterAware.js';

export interface IModifyBuilder<TInstance, TLifeTime extends LifeTime>
  extends IRegistrationBuilder<TInstance, TLifeTime> {
  decorate<TArgs extends any[]>(decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>): void;
  decorate<TArgs extends any[]>(
    dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>,
    decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
  ): void;

  configure<TArgs extends any[]>(configureFn: (instance: TInstance, ...args: TArgs) => MaybePromise<void>): void;
  configure<TArgs extends any[]>(
    dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>,
    configureFn: (instance: TInstance, ...args: TArgs) => MaybePromise<void>,
  ): void;
}

export interface ICascadeModifyBuilder<TInstance, TLifeTime extends LifeTime>
  extends IModifyBuilder<TInstance, TLifeTime> {
  cascade(): void;
  inherit(factory: (instance: TInstance) => MaybePromise<TInstance>): void;
}

export interface IModifyAware<TAllowedLifeTime extends LifeTime> {
  modify<TInstance, TLifeTime extends TAllowedLifeTime>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): TLifeTime extends LifeTime.cascading
    ? ICascadeModifyBuilder<TInstance, TLifeTime>
    : IModifyBuilder<TInstance, TLifeTime>;
}
