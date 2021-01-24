import * as React from 'react';
import { FunctionComponent, ReactElement, useRef } from 'react';
import { Container, container as buildContainer } from 'hardwired';
import { ContainerContext } from './ContainerContext';
import { ProviderResolver } from '../resolvers/ProviderResolver';

export type ContainerProviderProps = {
  container?: Container;
};

export const ContainerProvider: FunctionComponent<ContainerProviderProps> = ({ children, container }) => {
  const containerInstance = useRef(container || buildContainer());
  const providers: ReactElement[] = containerInstance.current.__getByType_experimental(ProviderResolver);

  const Providers: any = providers.reduce((providerChildren: ReactElement<any>, current: ReactElement) => {
    return React.cloneElement(current, { children: providerChildren });
  }, <>{children}</>);

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: containerInstance.current }} children={Providers} />;
};
