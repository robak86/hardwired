import { InstanceDefinition } from 'hardwired';
import { useRequestContainer } from '../context/ContainerContext';

export type UseDefinitionsHook = {
  <TInstance extends InstanceDefinition<any, any, []>, TInstances extends [TInstance] | [TInstance, ...TInstance[]]>(
    ...definitions: TInstances
  ): {
    [K in keyof TInstances]: TInstances[K] extends InstanceDefinition<infer TInstance, any, []> ? TInstance : unknown;
  };
};

export const useDefinitions: UseDefinitionsHook = (...definitions) => {
  const deps = definitions.flatMap(def => def.externalsValues);
  const container = useRequestContainer(deps);
  return container.getAll(...definitions) as any;
};
