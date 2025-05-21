import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionSymbol } from '../../definitions/def-symbol.js';

export interface IEagerInstantiationAware<TAllowedLifeTime extends LifeTime> {
  eager<TInstance, TLifeTime extends LifeTime>(def: IDefinitionSymbol<TInstance, TLifeTime>): unknown;
}
