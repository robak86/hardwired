import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../../../utils/async.js';
import type { ConstructorArgsTokens } from '../shared/AddDefinitionBuilder.js';
import type { IDefinitionToken } from '../../../../definitions/tokens.js';
import { MaybeAsync } from '../../../../utils/MaybeAsync.js';

import type { ILazyDefinitionBuilder } from './abstract/ILazyDefinitionBuilder.js';

export class DecoratedDefinitionBuilder<TInstance, TLifetime extends LifeTime, TArgs extends any[]>
  implements ILazyDefinitionBuilder<TInstance, TLifetime>
{
  constructor(
    public readonly token: IDefinitionToken<TInstance, TLifetime>,
    private dependencies: ConstructorArgsTokens<TArgs, TLifetime>,
    private decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
  ) {}

  build(def: IDefinition<TInstance, TLifetime>): IDefinition<TInstance, TLifetime> {
    return def.override((container, interceptor) => {
      return container.all(...this.dependencies).then(awaitedDependencies => {
        return def.create(container, interceptor).then(awaitedInstance => {
          return MaybeAsync.resolve(this.decorateFn(awaitedInstance, ...(awaitedDependencies as TArgs)));
        });
      });
    });
  }
}
