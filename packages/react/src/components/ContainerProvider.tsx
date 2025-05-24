import type { IContainer } from 'hardwired';
import { container as defaultContainer } from 'hardwired';
import type { FC, PropsWithChildren } from 'react';
import { useRef } from 'react';

import type { ContainerContextValue } from '../context/ContainerContext.js';
import { ContainerContext } from '../context/ContainerContext.js';

export type ContainerProviderProps = {
  container?: IContainer;
};

export const ContainerProvider: FC<ContainerProviderProps & PropsWithChildren> = ({ children, container }) => {
  const containerInstance = useRef<ContainerContextValue>({ container: container || defaultContainer });

  if (container && container !== containerInstance.current.container) {
    throw new Error('Container instance cannot be changed');
  }

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={containerInstance.current} children={children} />;
};
