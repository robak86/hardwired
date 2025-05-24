import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../definitions/def-symbol.js';

import type { IConfigureBuilder } from './IModifyAware.js';

export interface IEagerInstantiationAware<TAllowedLifeTime extends LifeTime> {
  eager<TInstance, TLifeTime extends TAllowedLifeTime>(
    def: IDefinitionToken<TInstance, TLifeTime>,
  ): IConfigureBuilder<TInstance, TLifeTime>;
}
