import { ContainerContext, useContainer } from '../context/ContainerContext.js';
import { useMemoized } from '../utils/useMemoized.js';
import { FC, PropsWithChildren } from 'react';
import { BaseDefinition } from 'hardwired';

export type ContainerScopeProps = {
  invalidateKeys?: ReadonlyArray<any>;
  overrides?: BaseDefinition<any, any, any, any>[];
};

export const ContainerScope: FC<ContainerScopeProps & PropsWithChildren> = ({
  children,
  invalidateKeys = [],
  overrides = [],
}) => {
  const container = useContainer();
  const getScopedContainer = useMemoized(() => {
    return container.checkoutScope({ scope: overrides }).checkoutScope();
  });

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: getScopedContainer(invalidateKeys) }} children={children} />;
};
