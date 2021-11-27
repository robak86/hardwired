import { InstanceDefinition } from 'hardwired';
import { useRequestContainer } from '../context/ContainerContext';

export type UseDefinitionsHook = {
  <TInstance extends InstanceDefinition<any, any>, TInstances extends [TInstance] | [TInstance, ...TInstance[]]>(
    definitions: TInstances,
  ): {
    [K in keyof TInstances]: TInstances[K] extends InstanceDefinition<infer TInstance, any> ? TInstance : unknown;
  };
};

// TODO: should accept multiple definition with the same externals and allows for passing externals as rest

export const useDefinitions: UseDefinitionsHook = definitions => {
  const container = useRequestContainer();
  return container.getAll(definitions) as any;
};
