import * as React from 'react';
import { FC, FunctionComponent, useEffect, useRef, useState } from 'react';
import { ContainerContext, useContainer } from '../context/ContainerContext';
import { Container } from 'hardwired';

export type ContainerScopeProps = {
  invalidateKeys?: ReadonlyArray<any>;
};

const areKeysShallowEqual = (arr1: ReadonlyArray<any>, arr2: ReadonlyArray<any>) => {
  return arr1.length === arr2.length && arr1.every((val, idx) => val === arr2[idx]);
};

export const ContainerScope: FC<ContainerScopeProps> = ({ children, invalidateKeys = [] }) => {
  const container = useContainer();
  const [scopedContainer, setScopedContainer] = useState<{
    invalidationKeys: ReadonlyArray<any>;
    container: Container | undefined;
  }>({ invalidationKeys: [], container: undefined });

  useEffect(() => {
    const areKeysShallowEqual1 = areKeysShallowEqual(invalidateKeys, scopedContainer.invalidationKeys);
    if (!areKeysShallowEqual1 || !scopedContainer.container) {
      setScopedContainer({ invalidationKeys: [...invalidateKeys], container: container.checkoutScope() });
    }
    return () => {
      // TODO: dispose ?
    };
  }, invalidateKeys);

  if (!scopedContainer.container) {
    return null;
  }

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: scopedContainer.container }} children={children} />;
};
