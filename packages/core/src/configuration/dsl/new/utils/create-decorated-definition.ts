import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { MaybePromise } from '../../../../utils/async.js';
import { maybePromiseThen } from '../../../../utils/async.js';
import type { IBindingsRegistryRead } from '../shared/AddDefinitionBuilder.js';
import type { ConstructorArgsSymbols } from '../ContainerSymbolBinder.js';

export function createDecoratedDefinition<TInstance, TLifetime extends LifeTime, TArgs extends any[]>(
  registry: IBindingsRegistryRead,
  defSymbol: IDefinitionSymbol<TInstance, TLifetime>,
  decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
  dependencies: ConstructorArgsSymbols<TArgs, TLifetime>,
): IDefinition<TInstance, TLifetime> {
  const def = registry.getDefinition(defSymbol) as IDefinition<TInstance, TLifetime> | undefined;

  if (!def) {
    throw new Error(
      `Cannot modify: ${defSymbol.toString()}. 
        Definition not found`,
    );
  }

  return def.override(container => {
    const deps = container.all(...dependencies);

    return maybePromiseThen(deps, (awaitedDependencies: TArgs) => {
      const instance = def.create(container);

      return maybePromiseThen(instance, awaitedInstance => {
        return decorateFn(awaitedInstance, ...awaitedDependencies);
      });
    });
  });
}
