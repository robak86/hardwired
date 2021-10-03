import { DependencySelector, InstanceDefinition } from 'hardwired';
import { useContainer } from '../context/ContainerContext';
import { useMemoized } from '../utils/useMemoized';

export type UseDefinitionHook = {
  <TReturn>(
    invalidateKeys: ReadonlyArray<any>,
    scopeOverrides: InstanceDefinition<any>[],
    selector: DependencySelector<TReturn>,
  ): TReturn;
};

export const useSelectScoped: UseDefinitionHook = (invalidateKeys, scopeOverrides, selector) => {
  const container = useContainer();
  const getInstance = useMemoized(() => {
    const scoped = container.checkoutScope({ scopeOverrides: scopeOverrides });
    return scoped.select(selector);
  });

  return getInstance(invalidateKeys);
};
