import { Module, ModuleBuilder } from 'hardwired';
import { useContainer } from '../context/ContainerContext';
import { useRef } from 'react';

export type UseDefinitionHook = {
  <TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
    module: TModule,
    name: TDefinitionName & string,
  ): Module.Materialized<TModule>[TDefinitionName];
};

export const useDefinition: UseDefinitionHook = (module, key) => {
  const container = useContainer();
  const instanceRef = useRef(container.get(module, key));

  return instanceRef.current;
};