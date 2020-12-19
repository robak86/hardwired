import { Module, ModuleBuilder } from '@hardwired/core';
import { useContainer } from '../components/ContainerContext';
import { useRef } from 'react';

type UseDependencyHook = <TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
  module: TModule,
  name: TDefinitionName & string,
) => Module.Materialized<TModule>[TDefinitionName];

export const useDependency: UseDependencyHook = (module, key) => {
  const instanceRef = useRef<any>();
  const container = useContainer();

  if (!instanceRef.current) {
    instanceRef.current = container.get(module, key);
  }

  return instanceRef.current;
};
