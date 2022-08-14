import { IFactory, InstanceDefinition, Resolution } from 'hardwired';
import { useContainer } from '../context/ContainerContext.js';
import { useMemoizedByRec } from '../utils/useMemoizedByRec.js';

export type UseFactoryHook = {
  <TInstance, TParams extends any[]>(
    factoryDefinition: InstanceDefinition<IFactory<TInstance, TParams>, any>,
    ...params: TParams
  ): TInstance;
};

export const useFactory: UseFactoryHook = (definition, params) => {
  if (definition.resolution !== Resolution.sync) {
    throw new Error(`Using async definitions in react components is not supported.`);
  }

  const container = useContainer();

  const getInstance = useMemoizedByRec(() => {
    return container.get(definition).build(params as any);
  });

  return getInstance(params);
};
