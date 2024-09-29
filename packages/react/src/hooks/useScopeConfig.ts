import { ConfigurationContainer, ScopeConfiguration, ScopeConfigurable } from 'hardwired';
import { DependencyList, useMemo } from 'react';

export const useScopeConfig = (
  configureFn: (scope: ScopeConfigurable, parentContainer: ConfigurationContainer) => void,
  deps: DependencyList = [],
): ScopeConfiguration => {
  return useMemo(() => new ScopeConfiguration(configureFn), deps);
};
