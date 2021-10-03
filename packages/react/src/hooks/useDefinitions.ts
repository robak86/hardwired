import { InstanceDefinition } from 'hardwired';
import { useContainer } from '../context/ContainerContext';

export type UseDefinitionsHook = {
  <TInstance extends InstanceDefinition<any>, TInstances extends [TInstance, ...TInstance[]]>(
    definitions: TInstances,
  ): {
    [K in keyof TInstances]: TInstances[K] extends InstanceDefinition<infer TInstance> ? TInstance : unknown;
  };
};

export const useDefinitions: UseDefinitionsHook = definitions => {
  const container = useContainer();
  return container.getAll(...definitions) as any;
};
