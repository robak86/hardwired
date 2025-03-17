import type { IContainer } from 'hardwired';
import { createContext, useContext } from 'react';

export type ContainerContextValue = {
  container: IContainer | undefined;
};

export const ContainerContext = createContext<ContainerContextValue>({
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
