import * as React from 'react';
import { FunctionComponent, useContext, useMemo } from 'react';
import { container, module, Module } from 'hardwired';
import { Container } from '../../../core/src/container/Container';
import { RegistryRecord } from '../../../core/src/module/RegistryRecord';
import { Component, ComponentProps, ComponentsDefinitionsKeys } from './Component';

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

export const createContainerProvider = () => ({ children }) => {
  const containerInstance = useMemo(() => container(Module.empty('root')), []);

  return <ContainerContext.Provider value={{ container: containerInstance }}>{children}</ContainerContext.Provider>;
};

const useDependency = <
  TRegistryRecord extends RegistryRecord,
  K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>
>(
  module: Module<TRegistryRecord>,
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
    module: Module<TRegistryRecord>,
    key: K,
  ) => RegistryRecord.Materialized<TRegistryRecord>[K];
  useContainer: () => RegistryRecord.Materialized<TRegistryRecord>;
  Component: <
    TRegistryRecord extends RegistryRecord,
    TComponentName extends ComponentsDefinitionsKeys<TRegistryRecord>
  >({
    module,
    name,
    ...rest
  }: ComponentProps<TRegistryRecord, TComponentName>) => React.ReactElement;
};

export function createContainer<TRegistryRecord extends RegistryRecord>(): ContainerComponents<TRegistryRecord> {
  return {
    Container: createContainerProvider() as any,
    Component,
    useDependency: useDependency as any,
    useContainer: useContainer as any,
  };
}
