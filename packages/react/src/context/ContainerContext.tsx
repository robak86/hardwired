import * as React from 'react';
import { useContext, useRef } from 'react';
import { Container, IContainer } from 'hardwired';
import invariant from 'tiny-invariant';

export type ContainerContextValue = {
  container: IContainer | undefined;
};

export const ContainerContext = React.createContext<ContainerContextValue>({
  container: undefined,
});

export const useContainerContext = (): ContainerContextValue => {
  return useContext(ContainerContext);
};

export const useContainer = (): IContainer => {
  const { container } = useContainerContext();
  invariant(container, `Cannot find container. Make sure that component is wrapped with ContainerProvider`);
  return container;
};

export const useRequestContainer = (): IContainer => {
  const { container } = useContainerContext();
  invariant(container, `Cannot find container. Make sure that component is wrapped with ContainerProvider`);

  const requestContainerRef = useRef<null | IContainer>();
  const parentContainerIdRef = useRef<null | string>();

  // if container stored in react context has changed we need to also revalidate request scope
  const containerHasChanged = parentContainerIdRef.current && parentContainerIdRef.current !== container.id;
  const componentRequestScopeIsMissing = !requestContainerRef.current;

  if (componentRequestScopeIsMissing || containerHasChanged) {
    requestContainerRef.current = container.checkoutRequestScope();
    parentContainerIdRef.current = container.id;
  }

  return requestContainerRef.current!;
};
