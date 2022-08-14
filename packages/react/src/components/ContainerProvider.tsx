import * as React from 'react';
import { FunctionComponent, PropsWithChildren, useRef } from 'react';
import { Container, container as buildContainer } from 'hardwired';
import { ContainerContext, ContainerContextValue } from '../context/ContainerContext.js';

export type ContainerProviderProps = {
  container?: Container;

};

export const ContainerProvider: FunctionComponent<ContainerProviderProps & PropsWithChildren> = ({
  children,
  container,
}) => {
  const containerInstance = useRef<ContainerContextValue | null>();

  if (!containerInstance.current) {
    containerInstance.current = {
      container: container || buildContainer(),
    };
  }

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={containerInstance.current} children={children} />;
};
