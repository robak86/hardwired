import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../definitions/def-symbol.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';

import type { ICascadeRootsRegistryRead } from './ICascadeRootsRegistry.js';

export interface IBindingsRegistryRead extends ICascadeRootsRegistryRead {
  getDefinition<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime>;

  getForOverride<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime>;
}
