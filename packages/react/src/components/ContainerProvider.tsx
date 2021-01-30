import * as React from 'react';
import { FunctionComponent, useRef } from 'react';
import { Container, container as buildContainer } from 'hardwired';
import { ContainerContext } from '../context/ContainerContext';

export type ContainerProviderProps = {
  container?: Container;
};

export const ContainerProvider: FunctionComponent<ContainerProviderProps> = ({ children, container }) => {
  const containerInstance = useRef(container || buildContainer());

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: containerInstance.current }} children={children} />;
};
