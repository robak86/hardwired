import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../../../utils/async.js';
import type { ConstructorArgsSymbols } from '../shared/AddDefinitionBuilder.js';
import type { IDefinitionToken } from '../../../../definitions/def-symbol.js';
import type { IBindingsRegistryRead } from '../../../../context/abstract/IBindingsRegistryRead.js';
import { MaybeAsync } from '../../../../utils/MaybeAsync.js';

import type { ILazyDefinitionBuilder } from './abstract/ILazyDefinitionBuilder.js';

export class DecoratedDefinitionBuilder<TInstance, TLifetime extends LifeTime, TArgs extends any[]>
  implements ILazyDefinitionBuilder<TInstance, TLifetime>
{
  constructor(
    public readonly token: IDefinitionToken<TInstance, TLifetime>,
    private dependencies: ConstructorArgsSymbols<TArgs, TLifetime>,
    private decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
  ) {}

  build(registry: IBindingsRegistryRead): IDefinition<TInstance, TLifetime> {
    const def = registry.getForOverride(this.token);

    return def.override((container, interceptor) => {
      return container.all(...this.dependencies).then(awaitedDependencies => {
        return def.create(container, interceptor).then(awaitedInstance => {
          return MaybeAsync.resolve(this.decorateFn(awaitedInstance, ...(awaitedDependencies as TArgs)));
        });
      });
    });
  }
}
