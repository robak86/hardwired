import type { TransientDefinition } from 'hardwired';
import { useCallback } from 'react';

import { useContainer } from '../context/ContainerContext.js';

export type UseDeferredHook = <TInstance, TArgs extends any[]>(
  factoryDefinition: TransientDefinition<TInstance, TArgs>,
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
