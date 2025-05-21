import type { IScopeConfigurable } from './abstract/IScopeConfigurable.js';
import type { ConfigurationContainer } from './ContainerConfiguration.js';

export type ScopeConfigureFn = (scope: IScopeConfigurable, parent: ConfigurationContainer) => void;
export type AsyncScopeConfigureFn = (scope: IScopeConfigurable, parent: ConfigurationContainer) => Promise<void>;

export const configureScope = <T extends ScopeConfigureFn | AsyncScopeConfigureFn>(configureFn: T): T => {
  return configureFn;
};
