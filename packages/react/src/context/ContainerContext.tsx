import * as React from 'react';
import { useContext, useRef } from 'react';
import { IContainer, RequestContainer } from 'hardwired';
import { ExternalValues, isShallowEqualRec } from '../utils/useMemoizedByRec.js';

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
  if (!container) {
    throw new Error(`Cannot find container. Make sure that component is wrapped with ContainerProvider`);
  }
  return container;
};

export const useRequestContainer = <T extends ExternalValues = never>(deps?: T): RequestContainer<T> => {
  const container = useContainer();

  const requestContainerRef = useRef<null | RequestContainer<any>>();
  const parentContainerIdRef = useRef<null | string>();
  const depsRef = useRef<undefined | ExternalValues>(undefined);

  // if container stored in react context has changed we need to also revalidate request scope
  const containerHasChanged = parentContainerIdRef.current && parentContainerIdRef.current !== container.id;
  const componentRequestScopeIsMissing = !requestContainerRef.current;
  const depsHasChanged = !isShallowEqualRec(depsRef.current, deps);

  if (depsHasChanged || componentRequestScopeIsMissing || containerHasChanged) {
    requestContainerRef.current = container.checkoutRequestScope(deps);
    parentContainerIdRef.current = container.id;
    depsRef.current = deps;
  }

  return requestContainerRef.current!;
};
