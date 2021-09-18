import { Module } from '../module/Module';
import { useContainer } from './useContainer';

export type UseDefinitionHook = {
  <TModule extends Module<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
    module: TModule,
    name: TDefinitionName & string,
  ): Module.Materialized<TModule>[TDefinitionName];
};

export const useDefinition: UseDefinitionHook = (module, key) => {
  const container = useContainer();
  return container.get(module, key);
};
