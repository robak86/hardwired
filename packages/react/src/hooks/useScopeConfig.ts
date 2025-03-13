import type { ScopeConfigureFn } from 'hardwired';
import type { DependencyList } from 'react';
import { useCallback } from 'react';

export const useScopeConfig = (configureFn: ScopeConfigureFn, deps: DependencyList = []): ScopeConfigureFn => {
  return useCallback(configureFn, deps);
};
