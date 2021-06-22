import * as React from 'react';
import { FC } from 'react';
import { ContainerContext, useContainer } from '../context/ContainerContext';
import { useMemoized } from '../utils/useMemoized';

export type ContainerScopeProps = {
  invalidateKeys?: ReadonlyArray<any>;
};

export const ContainerScope: FC<ContainerScopeProps> = ({ children, invalidateKeys = [] }) => {
  const container = useContainer();
  const getScopedContainer = useMemoized(() => container.checkoutScope());

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: getScopedContainer(invalidateKeys) }} children={children} />;
};
