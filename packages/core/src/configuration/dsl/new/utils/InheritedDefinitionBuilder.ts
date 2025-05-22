import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../../../utils/async.js';
import { maybePromiseThen } from '../../../../utils/async.js';
import type { ConstructorArgsSymbols } from '../shared/AddDefinitionBuilder.js';
import type { IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { IBindingsRegistryRead } from '../../../../context/abstract/IBindingsRegistryRead.js';

import type { ILazyDefinitionBuilder } from './abstract/ILazyDefinitionBuilder.js';

export class InheritedDefinitionBuilder<TInstance, TLifetime extends LifeTime, TArgs extends any[]>
  implements ILazyDefinitionBuilder<TInstance, TLifetime>
{
  constructor(
    public readonly defSymbol: IDefinitionSymbol<TInstance, TLifetime>,
    protected readonly _decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
    protected readonly _dependencies: ConstructorArgsSymbols<TArgs, TLifetime>,
  ) {}

  build(registry: IBindingsRegistryRead): IDefinition<TInstance, TLifetime> {
    if (registry.hasCascadingRoot(this.defSymbol.id)) {
      throw new Error('Cannot inherit cascading definition. Current scope already provides own definition.');
    }

    const def = registry.getDefinitionForOverride(this.defSymbol);

    return def.override(container => {
      const deps = container.all(...this._dependencies);

      return maybePromiseThen(deps, (awaitedDependencies: TArgs) => {
        const instance = def.create(container);

        return maybePromiseThen(instance, awaitedInstance => {
          return maybePromiseThen(this._decorateFn(awaitedInstance, ...awaitedDependencies), awaitedInstance => {
            if (instance === awaitedInstance) {
              throw new Error(
                `Callback for returning a new instance based on the inherited value from ${def.toString()} must return a new object.`,
              );
            }

            return awaitedInstance;
          });
        });
      });
    });
  }
}
