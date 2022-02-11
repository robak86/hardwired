import { InstanceDefinition } from 'hardwired';
import { useRequestContainer } from '../context/ContainerContext';

export type UseDefinitionsHook = {
  <
    TInstance extends InstanceDefinition<any, any, TExternals>,
    TInstances extends [TInstance] | [TInstance, ...TInstance[]],
    TExternals extends any[],
  >(
    definitions: TInstances,
    ...externals: TExternals
  ): {
    [K in keyof TInstances]: TInstances[K] extends InstanceDefinition<infer TInstance, any> ? TInstance : unknown;
  };
};

export const useDefinitions: UseDefinitionsHook = (definitions, ...externals) => {
  const container = useRequestContainer(externals);
  return container.getAll(definitions, ...externals) as any;
};
