import { container as buildContainer, IContainer } from 'hardwired';
import { ContainerContext, ContainerContextValue } from '../context/ContainerContext.js';
import { FC, PropsWithChildren, useRef } from 'react';

export type ContainerProviderProps = {
  container?: IContainer;
};

export const ContainerProvider: FC<ContainerProviderProps & PropsWithChildren> = ({ children, container }) => {
  const containerInstance = useRef<ContainerContextValue | null>();

  if (!containerInstance.current) {
    containerInstance.current = {
      container: container || buildContainer(),
    };
  }

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={containerInstance.current} children={children} />;
};
