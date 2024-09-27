import { ParentContainer, ScopeConfiguration, ScopeConfigureAware } from 'hardwired';
import { DependencyList, useMemo } from 'react';

export const useScopeConfig = (
  configureFn: (scope: ScopeConfigureAware, parentContainer: ParentContainer) => void,
  deps: DependencyList = [],
): ScopeConfiguration => {
  return useMemo(() => new ScopeConfiguration(configureFn), deps);
};
