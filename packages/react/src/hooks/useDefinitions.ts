import { InstanceDefinition, InstancesArray } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export type UseDefinitionsHook = {
  <TDefinitions extends InstanceDefinition<any, any, any>[]>(
    definitions: [...TDefinitions],
  ): InstancesArray<TDefinitions>;
};

export const useDefinitions: UseDefinitionsHook = (definitions: any) => {
  return useContainer().getAll(definitions as any) as any;
};
