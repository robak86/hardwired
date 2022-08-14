import { AnyInstanceDefinition, InstanceDefinition, InstancesArray } from 'hardwired';

import { useRequestContainer } from '../context/ContainerContext.js';

export type UseDefinitionsHook = {
  <TDefinitions extends InstanceDefinition<any, any>[]>(
    definitions: [...TDefinitions],
    ...provides: AnyInstanceDefinition<any, any>[]
  ): InstancesArray<TDefinitions>;
};

export const useDefinitions: UseDefinitionsHook = (definitions: any, ...[externalValues]) => {
  const container = useRequestContainer(externalValues);
  return container.getAll(definitions as any) as any;
};
