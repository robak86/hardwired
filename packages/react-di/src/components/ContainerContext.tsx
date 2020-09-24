import * as React from 'react';
import { useContext } from 'react';
import { container, module } from 'hardwired';
import { Container } from 'hardwired';

export type ContainerContextValue = {
  container: Container<any>;
};

const rootContainer = container(module('emptyModule'));

export const ContainerContext = React.createContext<ContainerContextValue>({
  container: rootContainer,
});

export const useContainerContext = (): ContainerContextValue => {
  return useContext(ContainerContext);
};
