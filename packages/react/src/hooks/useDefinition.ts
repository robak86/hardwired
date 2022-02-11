import { InstanceDefinition, LifeTime, Resolution } from 'hardwired';
import { useRequestContainer } from '../context/ContainerContext';
import invariant from 'tiny-invariant';

export type UseDefinitionHook = {
  <TInstance, TExternals extends any[], TExt>(
    factoryDefinition: InstanceDefinition<TInstance, LifeTime, TExternals>,
    ...params: TExternals
  ): TInstance;
};

export const useDefinition: UseDefinitionHook = (definition, ...externals) => {
  invariant(definition.resolution === Resolution.sync, `Using async definitions in react components is not supported.`);
  const container = useRequestContainer(externals);

  return container.get(definition, ...externals);
};
