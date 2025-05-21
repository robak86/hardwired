import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionSymbol } from '../../definitions/def-symbol.js';

import type { IConfigureBuilder } from './IModifyAware.js';

export interface ILazyInstantiationAware<TAllowedLifeTime extends LifeTime> {
  eager<TInstance, TLifeTime extends TAllowedLifeTime>(
    def: IDefinitionSymbol<TInstance, TLifeTime>,
  ): IConfigureBuilder<TInstance, TLifeTime>;
}
