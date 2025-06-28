import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { InstancesTokens } from '../shared/AddDefinitionBuilder.js';
import { MaybeAsync } from '../../../../utils/MaybeAsync.js';
import type { IDefinitionToken } from '../../../../definitions/DefinitionToken.js';

import type { ILazyDefinitionBuilder } from './abstract/ILazyDefinitionBuilder.js';

export class DecoratedDefinitionBuilder<TInstance, TLifetime extends LifeTime, TArgs extends any[]>
  implements ILazyDefinitionBuilder<TInstance, TLifetime>
{
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
