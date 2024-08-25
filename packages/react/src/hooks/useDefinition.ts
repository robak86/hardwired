import { BaseDefinition, LifeTime } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export type UseDefinitionHook = {
  <TInstance>(factoryDefinition: BaseDefinition<TInstance, LifeTime, any, any>): TInstance;
};

/**
 * @deprecated use "use" instead
 */
export const useDefinition: UseDefinitionHook = definition => {
  const container = useContainer();

  return container.use(definition) as any; // TODO: messed up by AsyncInstanceDefinition
};

export const use = useDefinition;
