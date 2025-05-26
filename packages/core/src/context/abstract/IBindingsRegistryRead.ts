import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../definitions/tokens.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';

export interface IBindingsRegistryRead {
  getDefinition<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime>;

  getForOverride<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime>;
}
