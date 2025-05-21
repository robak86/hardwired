import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionSymbol } from '../../definitions/def-symbol.js';
import type { OverridesConfigBuilder } from '../dsl/new/shared/OverridesConfigBuilder.js';

export interface IOverrideAware<TAllowedLifeTime extends LifeTime> {
  override<TInstance, TLifeTime extends TAllowedLifeTime>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): OverridesConfigBuilder<TInstance, TLifeTime>;
}
