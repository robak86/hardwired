import * as React from 'react';
import { FunctionComponent, ReactElement, useMemo } from 'react';
import { Container } from '@hardwired/core';
import { ContainerContext } from './ContainerContext';
import { BoundProvider, ProviderResolver } from '../resolvers/ProviderResolver';

export type ContainerProviderProps = {
  container: Container<any>;
};

export const ContainerProvider: FunctionComponent<ContainerProviderProps> = ({ children, container }) => {
  const containerInstance = useMemo(() => container, []);
  const providers = containerInstance.getByType(ProviderResolver);

  const Providers: any = providers.reduce((element: ReactElement<any>, current: BoundProvider<any>) => {
    return React.createElement(current.component, current.props, element);
  }, <>{children}</>);

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: containerInstance }} children={Providers} />;
};
