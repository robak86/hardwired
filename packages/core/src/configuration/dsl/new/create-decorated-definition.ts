import type { BindingsRegistry } from '../../../context/BindingsRegistry.js';
import type { IDefinitionSymbol } from '../../../definitions/def-symbol.js';
import type { IDefinition } from '../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../definitions/abstract/LifeTime.js';
import { isThenable } from '../../../utils/IsThenable.js';
import type { MaybePromise } from '../../../utils/async.js';

export function createDecoratedDefinition<TInstance, TLifetime extends LifeTime>(
  registry: BindingsRegistry,
  defSymbol: IDefinitionSymbol<TInstance, TLifetime>,
  decorateFn: (instance: TInstance) => MaybePromise<TInstance>,
): IDefinition<TInstance, TLifetime> {
  const def = registry.getDefinition(defSymbol) as IDefinition<TInstance, TLifetime> | undefined;

  if (!def) {
    throw new Error(
      `Cannot configure: ${defSymbol.toString()}. 
        Definition not found`,
    );
  }

  return def.override(container => {
    const instance = def.create(container);

    if (isThenable(instance)) {
      return instance.then(decorateFn);
    } else {
      return decorateFn(instance);
    }
  });
}
