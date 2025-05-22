import type { IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ConstructorArgsSymbols } from '../shared/AddDefinitionBuilder.js';
import { maybePromiseThen } from '../../../../utils/async.js';
import type { IBindingsRegistryRead } from '../../../../context/abstract/IBindingsRegistryRead.js';

export function createConfiguredDefinition<TInstance, TLifetime extends LifeTime, TArgs extends any[]>(
  registry: IBindingsRegistryRead,
  defSymbol: IDefinitionSymbol<TInstance, TLifetime>,
  configFn: (instance: TInstance, ...args: TArgs) => void | Promise<void>,
  dependencies: ConstructorArgsSymbols<TArgs, TLifetime>,
): IDefinition<TInstance, TLifetime> {
  const def = registry.getDefinitionForOverride(defSymbol) as IDefinition<TInstance, TLifetime> | undefined;

  if (!def) {
    throw new Error(
      `Cannot modify: ${defSymbol.toString()}. 
        Definition not found`,
    );
  }

  return def.override(container => {
    if (dependencies.length) {
      const deps = container.all(...dependencies);

      return maybePromiseThen(deps, (awaitedDependencies: TArgs) => {
        const instance = def.create(container);

        return maybePromiseThen(instance, awaitedInstance => {
          return maybePromiseThen(configFn(awaitedInstance, ...awaitedDependencies), () => {
            return instance;
          });
        });
      });
    } else {
      const instance = def.create(container);

      return maybePromiseThen(instance, awaitedInstance => {
        return maybePromiseThen((configFn as any)(awaitedInstance), () => {
          return instance;
        });
      });
    }
  });
}
