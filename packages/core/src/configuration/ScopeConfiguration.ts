import { ScopeConfigurable } from './abstract/ScopeConfigurable.js';
import { ConfigurationContainer } from './ContainerConfiguration.js';

export type ScopeConfigureFn = (scope: ScopeConfigurable, parent: ConfigurationContainer) => void;

export const configureScope = (configureFn: ScopeConfigureFn): ScopeConfigureFn => {
  return configureFn;
};
