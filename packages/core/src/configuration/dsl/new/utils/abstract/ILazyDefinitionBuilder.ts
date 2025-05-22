import type { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IBindingsRegistryRead } from '../../../../../context/abstract/IBindingsRegistryRead.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { IDefinitionSymbol } from '../../../../../definitions/def-symbol.js';

export interface ILazyDefinitionBuilder<TInstance, TLifetime extends LifeTime> {
  readonly symbol: IDefinitionSymbol<TInstance, TLifetime>;

  build(registry: IBindingsRegistryRead): IDefinition<TInstance, TLifetime>;
}
