import { ExternalsValues, InstanceDefinition, InstancesArray } from 'hardwired';
import { PickExternals } from 'hardwired/lib/utils/PickExternals';
import { useRequestContainer } from '../context/ContainerContext';

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
