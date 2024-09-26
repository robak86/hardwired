import { BaseDefinition, LifeTime } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';

export type UseDefinitionHook = {
  <TInstance>(factoryDefinition: BaseDefinition<TInstance, LifeTime, any>): TInstance;
};

export const use: UseDefinitionHook = definition => {
  const container = useContainer();

  return container.use(definition) as any; // TODO: messed up by AsyncInstanceDefinition
};
