import type { ScopeConfigurable } from './abstract/ScopeConfigurable.js';
import type { ConfigurationContainer } from './ContainerConfiguration.js';

export type ScopeConfigureFn = (scope: ScopeConfigurable, parent: ConfigurationContainer) => void;
export type AsyncScopeConfigureFn = (scope: ScopeConfigurable, parent: ConfigurationContainer) => Promise<void>;

export const configureScope = <T extends ScopeConfigureFn | AsyncScopeConfigureFn>(configureFn: T): T => {
  return configureFn;
};
