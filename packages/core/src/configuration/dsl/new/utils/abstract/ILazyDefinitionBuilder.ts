import type { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IBindingsRegistryRead } from '../../../../../context/abstract/IBindingsRegistryRead.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { IDefinitionToken } from '../../../../../definitions/tokens.js';

export interface ILazyDefinitionBuilder<TInstance, TLifetime extends LifeTime> {
  readonly token: IDefinitionToken<TInstance, TLifetime>;

  build(registry: IBindingsRegistryRead): IDefinition<TInstance, TLifetime>;
}
