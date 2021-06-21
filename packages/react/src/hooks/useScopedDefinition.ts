import { Module } from 'hardwired';
import { useContainer } from '../context/ContainerContext';
import { useRef } from 'react';

export type UseDefinitionHook = {
  <TModule extends Module<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
    invalidateKey: string | number,
    module: TModule,
    name: TDefinitionName & string,
  ): Module.Materialized<TModule>[TDefinitionName];
};

export const useScopedDefinition: UseDefinitionHook = (invalidateKey: string | number, module, key) => {
  const container = useContainer();
  const instanceRef = useRef(container.get(module, key));

  return instanceRef.current;
};
