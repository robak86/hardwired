import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { InstancesTokens } from '../shared/AddDefinitionBuilder.js';
import { MaybeAsync } from '../../../../utils/MaybeAsync.js';
import type { IDefinitionToken } from '../../../../definitions/DefinitionToken.js';

import type { IDefinitionTransform, TransformType } from './abstract/IDefinitionTransform.js';

export class DecorateTransform<TInstance, TLifetime extends LifeTime, TArgs extends any[]>
  implements IDefinitionTransform<TInstance, TLifetime>
{
  public readonly transformType: TransformType = 'decorate';

  constructor(
    public readonly token: IDefinitionToken<TInstance, TLifetime>,
    private readonly _dependencies: InstancesTokens<TArgs, TLifetime>,
    private readonly _decorateFn: (instance: TInstance, ...args: TArgs) => TInstance,
  ) {}

  build(def: IDefinition<TInstance, TLifetime>): IDefinition<TInstance, TLifetime> {
    return def.override((container, interceptor) => {
      return container.resolveAll(...this._dependencies).then(awaitedDependencies => {
        return def.create(container, interceptor).then(awaitedInstance => {
          return MaybeAsync.resolve(this._decorateFn(awaitedInstance, ...(awaitedDependencies as TArgs)));
        });
      });
    });
  }
}
