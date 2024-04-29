import { InstanceDefinition, InstancesArray } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export type UseDefinitionsHook = {
  <TDefinitions extends InstanceDefinition<any, any, any>[]>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions>;
};

export const useDefinitions: UseDefinitionsHook = (...definitions) => {
  return useContainer().useAll(...definitions) as any;
};
