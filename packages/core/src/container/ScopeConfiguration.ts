import { ScopeConfigureAware } from './abstract/ScopeConfigureAware.js';

export class ScopeConfiguration {
  constructor(private _applyFn: (container: ScopeConfigureAware) => void) {}

  apply(configurationAware: ScopeConfigureAware): void {
    this._applyFn(configurationAware);
  }
}

export const configure = (configureFn: (container: ScopeConfigureAware) => void): ScopeConfiguration => {
  return new ScopeConfiguration(configureFn);
};
