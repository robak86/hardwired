import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../../../utils/async.js';
import { maybePromiseThen } from '../../../../utils/async.js';
import type { ConstructorArgsSymbols } from '../shared/AddDefinitionBuilder.js';

export function createDecoratedDefinition<TInstance, TLifetime extends LifeTime, TArgs extends any[]>(
  def: IDefinition<TInstance, TLifetime>,
  decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
  dependencies: ConstructorArgsSymbols<TArgs, TLifetime>,
): IDefinition<TInstance, TLifetime> {
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
