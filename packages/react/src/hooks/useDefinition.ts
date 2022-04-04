import { InstanceDefinition, LifeTime, Resolution } from 'hardwired';
import { useRequestContainer } from '../context/ContainerContext';
import invariant from 'tiny-invariant';

export type UseDefinitionHook = {
  <TInstance, TExt>(factoryDefinition: InstanceDefinition<TInstance, LifeTime, []>, ...params: []): TInstance;
};

export const useDefinition: UseDefinitionHook = definition => {
  invariant(definition.resolution === Resolution.sync, `Using async definitions in react components is not supported.`);
  const container = useRequestContainer(definition.externalsValues);

  return container.get(definition);
};
