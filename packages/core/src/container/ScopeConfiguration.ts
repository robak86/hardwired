import { ContainerConfigureAware } from './abstract/ContainerConfigureAware.js';

export class ScopeConfiguration {
  constructor(private _applyFn: (container: ContainerConfigureAware) => void) {}

  apply(configurationAware: ContainerConfigureAware): void {
    this._applyFn(configurationAware);
  }
}

export const configure = (configureFn: (container: ContainerConfigureAware) => void): ScopeConfiguration => {
  return new ScopeConfiguration(configureFn);
};
