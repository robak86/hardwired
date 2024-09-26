import { BaseDefinition, LifeTime } from 'hardwired';

import { useEffect } from 'react';
import { useAll } from './useAll.js';

export type ContainerInitializerDefinition = BaseDefinition<() => void, LifeTime, any>;

export function useInitializers(...initializers: ContainerInitializerDefinition[]) {
  const initializerFns = useAll(...initializers);

  useEffect(() => {
    initializerFns.forEach(initializer => {
      initializer();
    });
  }, []);
}
