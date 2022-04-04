import { IFactory, InstanceDefinition, Resolution } from 'hardwired';
import invariant from 'tiny-invariant';
import { useContainer } from '../context/ContainerContext';
import { useMemoized } from '../utils/useMemoized';

export type UseFactoryHook = {
  <TInstance, TParams extends any[], TExt>(
    factoryDefinition: InstanceDefinition<IFactory<TInstance, TParams, TExt>, any, []>,
    ...params: TParams
  ): TInstance;
};

export const useFactory: UseFactoryHook = (definition, ...params) => {
  invariant(definition.resolution === Resolution.sync, `Using async definitions in react components is not supported.`);
  const container = useContainer();

  const getInstance = useMemoized(() => {
    return container.get(definition).build(...params);
  });

  return getInstance(params);
};
