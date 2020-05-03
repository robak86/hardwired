import * as React from 'react';
import { FunctionComponent, useContext, useMemo } from 'react';
import { Container, Module, module } from '@hardwired/di';

type HardwiredContext = {
  container: Container<any>;
};

const ContainerContext = React.createContext<HardwiredContext>({ container: module('emptyModule').toContainer({}) });

export const useContainer = () => {
  return useContext(ContainerContext);
};

export type ContainerProviderProps = {
  module: Module<any>;
};

export const ContainerProvider: FunctionComponent<ContainerProviderProps> = ({ children, module }) => {
  const container = useMemo(() => module.toContainer({}), [module]);

  return <ContainerContext.Provider value={{ container }}>{children}</ContainerContext.Provider>;
};

type ContainerComponents<P> = {
  Container: FunctionComponent<{ context: P }>;
};

export function createContainer<TRegistry>(module: Module<TRegistry>) {
  return {};
}
