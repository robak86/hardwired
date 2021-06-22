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
  const scopedContainer = useRef<{
    invalidationKeys: ReadonlyArray<any>;
    container: Container | undefined;
  }>({ invalidationKeys: [], container: undefined });

  function getScopedContainer(keys: ReadonlyArray<any>) {
    const areKeysShallowEqual1 = areKeysShallowEqual(keys, scopedContainer.current.invalidationKeys);
    if (!areKeysShallowEqual1 || !scopedContainer.current.container) {
      scopedContainer.current = { invalidationKeys: [...keys], container: container.checkoutScope() };
    }

    return scopedContainer.current.container;
  }

  // eslint-disable-next-line react/no-children-prop
  return <ContainerContext.Provider value={{ container: getScopedContainer(invalidateKeys) }} children={children} />;
};
