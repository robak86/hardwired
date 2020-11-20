import * as React from 'react';
import { useContext } from 'react';
import { Container } from 'hardwired';
import invariant from 'tiny-invariant';

export type ContainerContextValue = {
  container: Container<any> | undefined;
};

export const ContainerContext = React.createContext<ContainerContextValue>({
  container: undefined,
});

export const useContainerContext = (): ContainerContextValue => {
  return useContext(ContainerContext);
};

export const useContainer = (): Container => {
  const { container } = useContainerContext();
  invariant(container, `Cannot find container. Make sure that component is wrapped with ContainerProvider`);
  return container;
};
