import type { FC, PropsWithChildren } from 'react';
import type { ScopeConfigureFn } from 'hardwired';

import { ContainerContext, useContainer } from '../context/ContainerContext.js';
import { useMemoized } from '../utils/useMemoized.js';

export type ContainerScopeProps = {
  invalidateKeys?: ReadonlyArray<any>; // TODO: feels redundant. Most likely scope should be invalidated only by comparing config references
  config?: ScopeConfigureFn;
};

export const ContainerScope: FC<ContainerScopeProps & PropsWithChildren> = ({
  children,
  invalidateKeys = [],
  config,
}) => {
  const container = useContainer();
  const getScopedContainer = useMemoized(() => {
    if (config) {
      return container.scope(config);
    } else {
      return container.scope();
    }
  });

  return (
    <ContainerContext.Provider value={{ container: getScopedContainer([config, ...invalidateKeys]) }}>
      {children}
    </ContainerContext.Provider>
  );
};
