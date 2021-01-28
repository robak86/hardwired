import { Module, ModuleBuilder } from 'hardwired';
import { useContainer } from '../context/ContainerContext';
import { useRef } from 'react';
import { isObservable } from '../abstract/IObservable';

export type UseDefinitionHook = {
  <TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
    module: TModule,
    name: TDefinitionName & string,
  ): Module.Materialized<TModule>[TDefinitionName];
};

export const useDefinition: UseDefinitionHook = (module, key) => {
  const container = useContainer();
  const instanceRef = useRef(container.get(module, key));

  if (isObservable(instanceRef.current)) {
    console.error(`You probably meant to use useObservable hook for ${module.moduleId}:${key}`);
  }

  return instanceRef.current;
};
