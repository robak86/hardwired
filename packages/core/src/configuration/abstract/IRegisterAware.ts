import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionSymbol } from '../../definitions/def-symbol.js';
import type { SymbolsRegistrationBuilder } from '../dsl/new/shared/SymbolsRegistrationBuilder.js';

export interface IRegisterAware<TAllowedLifeTime extends LifeTime> {
  add<TInstance, TLifeTime extends TAllowedLifeTime>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): SymbolsRegistrationBuilder<TInstance, TLifeTime>;
}
