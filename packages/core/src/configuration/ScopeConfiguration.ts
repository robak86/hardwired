import type { IScopeConfigurable } from './abstract/IScopeConfigurable.js';

export type ScopeConfigureFn = (scope: IScopeConfigurable) => void;

export const configureScope = <T extends ScopeConfigureFn>(configureFn: T): T => {
  return configureFn;
};
