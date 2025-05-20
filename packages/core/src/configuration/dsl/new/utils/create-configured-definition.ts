import type { IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import { isThenable } from '../../../../utils/IsThenable.js';
import type { IBindingsRegistryRead } from '../scope/ScopeSymbolBinder.js';

export function createConfiguredDefinition<TInstance, TLifetime extends LifeTime>(
  registry: IBindingsRegistryRead,
  defSymbol: IDefinitionSymbol<TInstance, TLifetime>,
  configFn: (instance: TInstance) => void | Promise<void>,
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
      return instance.then(instance => {
        const configured = configFn(instance);

        if (isThenable(configured)) {
          return configured.then(() => instance);
        }

        return instance;
      });
    } else {
      const configured = configFn(instance);

      if (isThenable(configured)) {
        return configured.then(() => instance);
      }

      return instance;
    }
  });
}
