import { Definition, LifeTime } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';
import { useCallback } from 'react';

export type UseDeferredHook = {
  <TInstance, TArgs extends any[]>(
    factoryDefinition: Definition<TInstance, LifeTime.transient, TArgs>,
  ): (...args: TArgs) => TInstance;
};

export const useDeferred: UseDeferredHook = definition => {
  const container = useContainer();

  return useCallback(
    (...args) => {
      return container.use(definition, ...args);
    },
    [container],
  );
};
