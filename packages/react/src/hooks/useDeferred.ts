import type { Definition, LifeTime } from 'hardwired';
import { useCallback } from 'react';

import { useContainer } from '../context/ContainerContext.js';

export type UseDeferredHook = <TInstance, TArgs extends any[]>(
  factoryDefinition: Definition<TInstance, LifeTime.transient, TArgs>,
) => (...args: TArgs) => TInstance;

export const useDeferred: UseDeferredHook = definition => {
  const container = useContainer();

  return useCallback(
    (...args) => {
      return container.call(definition, ...args);
    },
    [container, definition],
  );
};
