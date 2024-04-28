import { InstanceDefinition, LifeTime } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export type UseDefinitionHook = {
  <TInstance>(factoryDefinition: InstanceDefinition<TInstance, LifeTime, any>): TInstance;
};

export const useDefinition: UseDefinitionHook = definition => {
  const container = useContainer();

  return container.use(definition);
};
