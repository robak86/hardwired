import * as React from 'react';

import { IContainer } from 'hardwired';

export type ContainerContextValue = {
  container: IContainer | undefined;
};

export const ContainerContext = React.createContext<ContainerContextValue>({
  container: undefined,
});

export const useContainerContext = (): ContainerContextValue => {
  return React.useContext(ContainerContext);
};

export const useContainer = (): IContainer => {
  const { container } = useContainerContext();
  if (!container) {
    throw new Error(`Cannot find container. Make sure that component is wrapped with ContainerProvider`);
  }
  return container;
};
