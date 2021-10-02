import { useContainer } from '../context/ContainerContext';
import { useMemoized } from '../utils/useMemoized';
import { InstanceDefinition } from 'hardwired';

export type UseDefinitionHook = {
  <TInstance>(invalidateKeys: ReadonlyArray<any>, module: InstanceDefinition<TInstance>): TInstance;
};

export const useScopedDefinition: UseDefinitionHook = (invalidateKeys, definition) => {
  const container = useContainer();
  const getInstance = useMemoized(() => {
    const scoped = container.checkoutScope();
    return scoped.get(definition);
  });

  return getInstance(invalidateKeys);
};
