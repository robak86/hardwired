import { InstanceDefinition, Resolution } from 'hardwired';
import { useContainer, useRequestContainer } from '../context/ContainerContext';
import invariant from 'tiny-invariant';

export type UseDefinitionHook = {
  <TInstance>(definition: InstanceDefinition<TInstance, any, []>): TInstance;
};

export const useDefinition: UseDefinitionHook = definition => {
  invariant(definition.resolution === Resolution.sync, `Using async definitions in react components is not supported.`);
  const container = useContainer();

  const value = container.get(definition);
  console.log(value, (container as any).id);
  return value;
};
