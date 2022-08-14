import * as React from 'react';
import { FunctionComponent, PropsWithChildren } from 'react';
import { ContainerContext, useContainer } from '../context/ContainerContext.js';
import { useMemoized } from '../utils/useMemoized.js';

export type ContainerRequestProps = {
  invalidateKeys?: ReadonlyArray<any>;
};

export const ContainerRequest: FunctionComponent<ContainerRequestProps & PropsWithChildren> = ({
  children,
  invalidateKeys = [],
}) => {
  const container = useContainer();
  const getRequestContainer = useMemoized(() => {
    return container.checkoutRequestScope();
  });

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: getRequestContainer(invalidateKeys) }} children={children} />;
};
