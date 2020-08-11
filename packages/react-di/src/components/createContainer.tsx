import * as React from 'react';
import { FunctionComponent, useContext, useMemo } from 'react';
import { container, module, ModuleBuilder } from '@hardwired/di-next';
import { Container } from '../../../di-next/src/container/Container';
import { RegistryRecord } from '../../../di-next/src/module/RegistryRecord';

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
  module: ModuleBuilder<any>;
};
//
// type ModuleRegistryContext<T> = any;
// type DeepGetReturn<T, T2, T3> = any;
// type MaterializedDefinitions<T> = any;

export const createContainerProvider = module => ({ children }) => {
  const containerInstance = useMemo(() => container(module), [module]);

  return <ContainerContext.Provider value={{ container: containerInstance }}>{children}</ContainerContext.Provider>;
};

const useDependency = <
  TRegistryRecord extends RegistryRecord,
  K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>
>(
  module: ModuleBuilder<TRegistryRecord>,
  key: K,
) => {
  const { container } = useContainerContext();
  return container.get(module, key); //TODO: leveraging only container cache. We have to be sure that it works
};

type ContainerComponents<TRegistryRecord extends RegistryRecord> = {
  Container: FunctionComponent<{ context: any }>;
  useDependency: <
    TRegistryRecord extends RegistryRecord,
    K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>
  >(
    module: ModuleBuilder<TRegistryRecord>,
    key: K,
  ) => RegistryRecord.Materialized<TRegistryRecord>[K];
  useContainer: () =>  RegistryRecord.Materialized<TRegistryRecord>;
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
