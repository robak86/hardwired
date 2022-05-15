import { ExternalsValues, InstanceDefinition, InstancesArray, PickExternals } from 'hardwired';

import { useRequestContainer } from '../context/ContainerContext.js';

export type UseDefinitionsHook = {
  <TDefinitions extends InstanceDefinition<any, any, any>[]>(
    definitions: [...TDefinitions],
    ...[externals]: ExternalsValues<PickExternals<TDefinitions>>
  ): InstancesArray<TDefinitions>;
};

export const useDefinitions: UseDefinitionsHook = (definitions: any, ...[externalValues]) => {
  const container = useRequestContainer(externalValues);
  return container.getAll(definitions as any) as any;
};
