import { BaseDefinition, InstanceDefinition, InstancesArray } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export type UseDefinitionsHook = {
  <TDefinitions extends Array<InstanceDefinition<any, any, any> | BaseDefinition<any, any, any>>>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions>;
};

/**
 * @deprecated use "useAll" instead
 */
export const useDefinitions: UseDefinitionsHook = (...definitions) => {
  return useContainer().all(...definitions) as any;
};

export const useAll = useDefinitions;
