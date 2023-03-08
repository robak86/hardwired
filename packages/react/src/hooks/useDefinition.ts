import { InstanceDefinition, LifeTime, Resolution } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export type UseDefinitionHook = {
  <TInstance, TExt>(factoryDefinition: InstanceDefinition<TInstance, LifeTime>): TInstance;
};

export const useDefinition: UseDefinitionHook = definition => {
  if (definition.resolution !== Resolution.sync) {
    throw new Error(`Using async definitions in react components is not supported.`);
  }

  const container = useContainer();

  return container.get(definition);
};
