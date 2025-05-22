import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { ConstructorArgsSymbols } from '../shared/AddDefinitionBuilder.js';
import { maybePromiseThen } from '../../../../utils/async.js';

export function createConfiguredDefinition<TInstance, TLifetime extends LifeTime, TArgs extends any[]>(
  def: IDefinition<TInstance, TLifetime>,
  configFn: (instance: TInstance, ...args: TArgs) => void | Promise<void>,
  dependencies: ConstructorArgsSymbols<TArgs, TLifetime>,
): IDefinition<TInstance, TLifetime> {
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
