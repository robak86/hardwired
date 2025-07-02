import type { LifeTime } from '../../../../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../../../../definitions/abstract/IDefinition.js';
import type { IDefinitionToken } from '../../../../../definitions/DefinitionToken.js';

export type TransformType = 'inherit' | 'decorate' | 'configure';

export interface IDefinitionTransform<TInstance, TLifetime extends LifeTime> {
  readonly token: IDefinitionToken<TInstance, TLifetime>; // TODO: most likely can be removed
  readonly transformType: TransformType;

  build(def: IDefinition<TInstance, TLifetime>): IDefinition<TInstance, TLifetime>;
}
