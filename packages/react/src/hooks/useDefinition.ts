import { InstanceDefinition } from 'hardwired';
import { useContainer } from '../context/ContainerContext';

export type UseDefinitionHook = {
  <TInstance>(definition: InstanceDefinition<TInstance, any>): TInstance;
};

export const useDefinition: UseDefinitionHook = definition => {
  const container = useContainer();
  return container.get(definition);
};
