import * as React from 'react';

import {container as buildContainer, IContainer} from 'hardwired';
import {ContainerContext, ContainerContextValue} from '../context/ContainerContext.js';

export type ContainerProviderProps = {
  container?: IContainer
};

export const ContainerProvider: React.FC<ContainerProviderProps & React.PropsWithChildren> = ({
  children,
  container,
}) => {
  const containerInstance = React.useRef<ContainerContextValue | null>();

  if (!containerInstance.current) {
    containerInstance.current = {
      container: container || buildContainer(),
    };
  }

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={containerInstance.current} children={children} />;
};
