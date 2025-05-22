import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionSymbol } from '../../definitions/def-symbol.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';

import type { ICascadeRootsRegistryRead } from './ICascadeRootsRegistry.js';

export interface IBindingsRegistryRead extends ICascadeRootsRegistryRead {
  getDefinition<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime>;

  getDefinitionForOverride<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime>;
}
