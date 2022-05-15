import { ExternalsValues, InstanceDefinition, LifeTime, Resolution } from 'hardwired';
import { useRequestContainer } from '../context/ContainerContext.js';

export type UseDefinitionHook = {
  <TInstance, TExt>(
    factoryDefinition: InstanceDefinition<TInstance, LifeTime, TExt>,
    ...externals: ExternalsValues<TExt>
  ): TInstance;
};

export const useDefinition: UseDefinitionHook = (definition, ...[externalValues]) => {
  if (definition.resolution !== Resolution.sync) {
    throw new Error(`Using async definitions in react components is not supported.`);
  }
  const container = useRequestContainer(externalValues as any);

  return container.get(definition);
};
