import { BaseDefinition, InstanceDefinition, LifeTime, Resolution } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export type UseDefinitionHook = {
  <TInstance>(
    factoryDefinition: InstanceDefinition<TInstance, LifeTime, any> | BaseDefinition<TInstance, LifeTime, any, any>,
  ): TInstance;
};

/**
 * @deprecated use "use" instead
 */
export const useDefinition: UseDefinitionHook = definition => {
  if (definition.resolution !== Resolution.sync) {
    throw new Error(`Using async definitions in react components is not supported.`);
  }

  const container = useContainer();

  return container.use(definition) as any; // TODO: messed up by AsyncInstanceDefinition
};

export const use = useDefinition;
