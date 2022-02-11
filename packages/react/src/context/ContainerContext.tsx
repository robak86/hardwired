import * as React from 'react';
import { useContext, useRef } from 'react';
import { IContainer } from 'hardwired';
import invariant from 'tiny-invariant';
import { isShallowEqual } from '../utils/useMemoized';

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

export const useRequestContainer = (deps: any[] = []): IContainer => {
  const { container } = useContainerContext();
  invariant(container, `Cannot find container. Make sure that component is wrapped with ContainerProvider`);

  const requestContainerRef = useRef<null | IContainer>();
  const parentContainerIdRef = useRef<null | string>();
  const depsRef = useRef<null | any[]>();

  // if container stored in react context has changed we need to also revalidate request scope
  const containerHasChanged = parentContainerIdRef.current && parentContainerIdRef.current !== container.id;
  const componentRequestScopeIsMissing = !requestContainerRef.current;
  const depsHasChanged = !isShallowEqual(depsRef.current ?? [], deps);

  if (depsHasChanged || componentRequestScopeIsMissing || containerHasChanged) {
    requestContainerRef.current = container.checkoutRequestScope();
    parentContainerIdRef.current = container.id;
    depsRef.current = [...deps];
  }

  return requestContainerRef.current!;
};
