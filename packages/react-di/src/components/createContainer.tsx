import * as React from 'react';
import { FunctionComponent, useContext, useMemo } from 'react';
import {
  container,
  Container,
  DeepGetReturn,
  MaterializedDefinitions,
  ModuleBuilder,
  RegistryRecord,
  ModuleRegistryContext,
  Module,
} from '@hardwired/di-core';
import { module } from '@hardwired/di';

type HardwiredContext = {
  container: Container<any>;
};

const ContainerContext = React.createContext<HardwiredContext>({ container: container(module('emptyModule')) });

export const useContainerContext = (): HardwiredContext => {
  return useContext(ContainerContext);
};

const useContainer = () => {
  return useContainerContext().container.asObject();
};

export type ContainerProviderProps = {
  module: Module<any>;
};

export const createContainerProvider = module => ({ children }) => {
  const containerInstance = useMemo(() => container(module), [module]);

  return <ContainerContext.Provider value={{ container: containerInstance }}>{children}</ContainerContext.Provider>;
};

const useDependency = (module: any, key: any) => {
  const { container } = useContainerContext();
  return container.deepGet<any, any>(module, key); //TODO: leveraging only container cache. We have to be sure that it works
};

type ContainerComponents<TRegistryRecord extends RegistryRecord> = {
  Container: FunctionComponent<{ context: ModuleRegistryContext<TRegistryRecord> }>;
  useDependency: <
    TModuleRegistry extends RegistryRecord,
    TModuleRegistryKey extends keyof MaterializedDefinitions<TModuleRegistry>
  >(
    module: ModuleBuilder<TModuleRegistry>,
    key: TModuleRegistryKey,
  ) => DeepGetReturn<TModuleRegistryKey, TModuleRegistry, TRegistryRecord>;
  useContainer: () => MaterializedDefinitions<TRegistryRecord>;
};

// TODO: allow thunk returning promise for lazy loading ?
export function createContainer<TRegistryRecord extends RegistryRecord>(
  module: ModuleBuilder<TRegistryRecord>,
): ContainerComponents<TRegistryRecord> {
  return {
    Container: createContainerProvider(module) as any,
    useDependency: useDependency as any,
    useContainer: useContainer as any,
  };
}
