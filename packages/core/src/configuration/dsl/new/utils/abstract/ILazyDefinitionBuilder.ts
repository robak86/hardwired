import type { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { IDefinitionToken } from '../../../../../definitions/DefinitionToken.js';

export interface ILazyDefinitionBuilder<TInstance, TLifetime extends LifeTime> {
  readonly token: IDefinitionToken<TInstance, TLifetime>; // TODO: most likely can be removed

  build(def: IDefinition<TInstance, TLifetime>): IDefinition<TInstance, TLifetime>;
}
