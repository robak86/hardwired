import { ContainerContext, useContainer } from '../context/ContainerContext.js';
import { useMemoized } from '../utils/useMemoized.js';
import { FC, PropsWithChildren } from 'react';
import { ScopeConfiguration } from 'hardwired';

export type ContainerScopeProps = {
  invalidateKeys?: ReadonlyArray<any>; // TODO: feels redundant. Most likely scope should be invalidated only by comparing config references
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

  return (
    <ContainerContext.Provider value={{ container: getScopedContainer([config, ...invalidateKeys]) }}>
      {children}
    </ContainerContext.Provider>
  );
};
