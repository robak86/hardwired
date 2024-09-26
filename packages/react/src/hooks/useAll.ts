import { BaseDefinition, InstancesArray } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export type UseDefinitionsHook = {
  <TDefinitions extends Array<BaseDefinition<any, any, any, []>>>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions>;
};

export const useAll: UseDefinitionsHook = (...definitions) => {
  return useContainer().all(...definitions) as any;
};
