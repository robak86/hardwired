import { Module } from 'hardwired';
import { useContainer } from '../context/ContainerContext';
import { useMemoized } from '../utils/useMemoized';

export type UseDefinitionHook = {
  <TModule extends Module<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
    invalidateKeys: ReadonlyArray<any>,
    module: TModule,
    name: TDefinitionName & string,
  ): Module.Materialized<TModule>[TDefinitionName];
};

export const useScopedDefinition: UseDefinitionHook = (invalidateKeys, module, key) => {
  const container = useContainer();
  const getInstance = useMemoized(() => {
    const scoped = container.checkoutScope();
    return scoped.get(module, key);
  });

  return getInstance(invalidateKeys);
};
