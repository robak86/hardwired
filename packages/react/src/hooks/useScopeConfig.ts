import { ScopeConfigureFn } from 'hardwired';
import { DependencyList, useCallback } from 'react';

export const useScopeConfig = (configureFn: ScopeConfigureFn, deps: DependencyList = []): ScopeConfigureFn => {
  return useCallback(configureFn, deps);
};
