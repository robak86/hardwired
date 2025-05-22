import type { IScopeConfigurable } from './abstract/IScopeConfigurable.js';
import { ScopeConfigurationBuilder } from './dsl/new/scope/ScopeConfigurationBuilder.js';
import type { ScopeConfiguration } from './dsl/new/container/ContainerConfiguration.js';

export type ScopeConfigureFn = (scope: IScopeConfigurable) => void;

export const configureScope = <T extends ScopeConfigureFn>(configureFn: T): ScopeConfiguration => {
  const scopeConfiguration = new ScopeConfigurationBuilder();

  configureFn(scopeConfiguration);

  return scopeConfiguration.toConfig();
};
