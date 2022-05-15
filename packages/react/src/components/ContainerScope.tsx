import * as React from 'react';
import { FC } from 'react';
import { ContainerContext, useContainer } from '../context/ContainerContext.js';
import { useMemoized } from '../utils/useMemoized.js';
import { InstanceDefinition } from 'hardwired';

export type ContainerScopeProps = {
  invalidateKeys?: ReadonlyArray<any>;
  scopeOverrides?: InstanceDefinition<any, any, never>[];
};

export const ContainerScope: FC<ContainerScopeProps> = ({ children, invalidateKeys = [], scopeOverrides = [] }) => {
  const container = useContainer();
  const getScopedContainer = useMemoized(() => {
    return container.checkoutScope({ scopeOverrides });
  });

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: getScopedContainer(invalidateKeys) }} children={children} />;
};
