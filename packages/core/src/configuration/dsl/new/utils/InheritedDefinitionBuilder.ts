import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../../../utils/async.js';
import type { ConstructorArgsSymbols } from '../shared/AddDefinitionBuilder.js';
import type { IDefinitionToken } from '../../../../definitions/def-symbol.js';
import type { IBindingsRegistryRead } from '../../../../context/abstract/IBindingsRegistryRead.js';
import { MaybeAsync } from '../../../../utils/MaybeAsync.js';

import type { ILazyDefinitionBuilder } from './abstract/ILazyDefinitionBuilder.js';

export class InheritedDefinitionBuilder<TInstance, TLifetime extends LifeTime, TArgs extends any[]>
  implements ILazyDefinitionBuilder<TInstance, TLifetime>
{
  constructor(
    public readonly token: IDefinitionToken<TInstance, TLifetime>,
    protected readonly _decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
    protected readonly _dependencies: ConstructorArgsSymbols<TArgs, TLifetime>,
  ) {}

  build(registry: IBindingsRegistryRead): IDefinition<TInstance, TLifetime> {
    if (registry.hasCascadingRoot(this.token.id)) {
      throw new Error('Cannot inherit cascading definition. Current scope already provides own definition.');
    }

    const def = registry.getForOverride(this.token);

    return def.override((container, interceptor) => {
      return container.all(...this._dependencies).then(awaitedDependencies => {
        return def.create(container, interceptor).then(awaitedInstance => {
          return MaybeAsync.resolve(this._decorateFn(awaitedInstance, ...(awaitedDependencies as TArgs)));
        });
      });
    });
  }
}
