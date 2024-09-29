import { ScopeConfigurable } from './abstract/ScopeConfigurable.js';
import { ConfigurationContainer } from './ContainerConfiguration.js';
import { ScopeConfigurationDSL } from './dsl/ScopeConfigurationDSL.js';

export class ScopeConfiguration {
  constructor(private readonly _configure: (scope: ScopeConfigurable, parent: ConfigurationContainer) => void) {}

  apply(parent: ConfigurationContainer): ScopeConfigurationDSL {
    const binder = new ScopeConfigurationDSL(parent);
    this._configure(binder, parent);
    return binder;
  }
}

export type ScopeConfigureCallback = (scope: ScopeConfigurable, parent: ConfigurationContainer) => void;
export const configureScope = (
  configureFn: (scope: ScopeConfigurable, parentContainer: ConfigurationContainer) => void,
): ScopeConfiguration => {
  return new ScopeConfiguration(configureFn);
};
