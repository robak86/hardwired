import { BaseDefinition, InstanceDefinition, LifeTime } from 'hardwired';
import { useDefinitions } from './useDefinitions.js';
import { useEffect } from 'react';

export type ContainerInitializerDefinition =
  | InstanceDefinition<() => void, LifeTime, any>
  | BaseDefinition<() => void, LifeTime, any>;

export function useInitializers(...initializers: ContainerInitializerDefinition[]) {
  const initializerFns = useDefinitions(...initializers);

  useEffect(() => {
    initializerFns.forEach(initializer => {
      initializer();
    });
  }, []);
}
