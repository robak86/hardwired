import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../../../utils/async.js';
import { maybePromiseThen } from '../../../../utils/async.js';
import type { ConstructorArgsSymbols } from '../shared/AddDefinitionBuilder.js';
import type { IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { IBindingsRegistryRead } from '../../../../context/abstract/IBindingsRegistryRead.js';

export class DecoratedDefinitionBuilder<TInstance, TLifetime extends LifeTime, TArgs extends any[]> {
  constructor(
    public readonly symbol: IDefinitionSymbol<TInstance, TLifetime>,
    private dependencies: ConstructorArgsSymbols<TArgs, TLifetime>,
    private decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
  ) {}

  build(registry: IBindingsRegistryRead): IDefinition<TInstance, TLifetime> {
    const def = registry.getDefinitionForOverride(this.symbol);

    return def.override(container => {
      const deps = container.all(...this.dependencies);

      return maybePromiseThen(deps, (awaitedDependencies: TArgs) => {
        const instance = def.create(container);

        return maybePromiseThen(instance, awaitedInstance => {
          return this.decorateFn(awaitedInstance, ...awaitedDependencies);
        });
      });
    });
  }
}
