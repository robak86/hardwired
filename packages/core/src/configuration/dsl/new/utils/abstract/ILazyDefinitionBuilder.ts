import type { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IBindingsRegistryRead } from '../../../../../context/abstract/IBindingsRegistryRead.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';

export interface ILazyDefinitionBuilder<TInstance, TLifetime extends LifeTime> {
  build(registry: IBindingsRegistryRead): IDefinition<TInstance, TLifetime>;
}
