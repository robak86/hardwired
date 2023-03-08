import * as React from 'react';

import { ContainerContext, useContainer } from '../context/ContainerContext.js';
import { useMemoized } from '../utils/useMemoized.js';
import { InstanceDefinition } from 'hardwired';

export type ContainerScopeProps = {
  invalidateKeys?: ReadonlyArray<any>;
  overrides?: InstanceDefinition<any, any>[];
};

export const ContainerScope: React.FC<ContainerScopeProps & React.PropsWithChildren> = ({
  children,
  invalidateKeys = [],
  overrides = [],
}) => {
  const container = useContainer();
  const getScopedContainer = useMemoized(() => {
    return container.checkoutScope({ overrides }).checkoutScope();
  });

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: getScopedContainer(invalidateKeys) }} children={children} />;
};
