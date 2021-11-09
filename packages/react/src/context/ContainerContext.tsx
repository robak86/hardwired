import * as React from 'react';
import { useContext, useRef } from 'react';
import { Container, IContainer } from 'hardwired';
import invariant from 'tiny-invariant';

export type ContainerContextValue = {
  container: Container | undefined;
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

export const useRequestContainer = (): IContainer => {
  const { container } = useContainerContext();
  invariant(container, `Cannot find container. Make sure that component is wrapped with ContainerProvider`);

  const requestContainer = useRef<null | IContainer>();
  if (!requestContainer.current) {
    requestContainer.current = container.checkoutRequestScope();
  }

  return requestContainer.current;
};
