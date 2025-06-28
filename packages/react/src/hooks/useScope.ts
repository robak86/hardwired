import type { IContainer, ScopeConfigureFn } from 'hardwired';
import { useEffect, useRef } from 'react';

import { useContainer } from '../context/ContainerContext.js';

const emptyArray: ReadonlyArray<string | number | boolean> = [];

export const useScope = (
  configs: ScopeConfigureFn[],
  invalidateKeys: ReadonlyArray<string | number | boolean> = emptyArray,
) => {
  const container = useContainer();

  const scopeRef = useRef<IContainer>(container.scope(...configs));

  useEffect(() => {
    scopeRef.current = container.scope(...configs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...invalidateKeys, ...configs]);

  return scopeRef.current;
};
