import { ContainerContext, useContainer } from '../context/ContainerContext.js';
import { useMemoized } from '../utils/useMemoized.js';
import { FC, PropsWithChildren } from 'react';
import { ScopeConfiguration } from 'hardwired';

export type ContainerScopeProps = {
  invalidateKeys?: ReadonlyArray<any>;
  config?: ScopeConfiguration;
};

export const ContainerScope: FC<ContainerScopeProps & PropsWithChildren> = ({
  children,
  invalidateKeys = [],
  config,
}) => {
  const container = useContainer();
  const getScopedContainer = useMemoized(() => {
    return container.checkoutScope(config).checkoutScope();
  });

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: getScopedContainer(invalidateKeys) }} children={children} />;
};
