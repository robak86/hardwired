import * as React from 'react';
import { FunctionComponent, useContext, useMemo } from 'react';
import {
  container,
  Container,
  DeepGetReturn,
  MaterializedDefinitions,
  Module,
  module,
  ModuleBuilder,
  ModuleRegistry,
  ModuleRegistryContext,
} from '@hardwired/di';

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

type ContainerComponents<TRegistry extends ModuleRegistry> = {
  Container: FunctionComponent<{ context: ModuleRegistryContext<TRegistry> }>;
  useDependency: <
    TModuleRegistry extends ModuleRegistry,
    TModuleRegistryKey extends keyof MaterializedDefinitions<TModuleRegistry>
  >(
    module: ModuleBuilder<TModuleRegistry>,
    key: TModuleRegistryKey,
  ) => DeepGetReturn<TModuleRegistryKey, TModuleRegistry, TRegistry>;
  useContainer: () => MaterializedDefinitions<TRegistry>;
};

// TODO: allow thunk returning promise for lazy loading ?
export function createContainer<TRegistry extends ModuleRegistry>(
  module: ModuleBuilder<TRegistry>,
): ContainerComponents<TRegistry> {
  return {
    Container: createContainerProvider(module) as any,
    useDependency: useDependency as any,
    useContainer: useContainer as any,
  };
}
