import { InstanceDefinition } from 'hardwired';
import { useContainer } from '../context/ContainerContext';

export type UseDefinitionHook = {
  <TInstance>(definition: InstanceDefinition<TInstance>): TInstance;
};

export const useDefinition: UseDefinitionHook = definition => {
  const container = useContainer();
  return container.get(definition);
};
