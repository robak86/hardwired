import type { IScopeConfigurable } from './abstract/IScopeConfigurable.js';

export type ScopeConfigureFn = (scope: IScopeConfigurable) => void;
export type AsyncScopeConfigureFn = (scope: IScopeConfigurable) => Promise<void>;

export const configureScope = <T extends ScopeConfigureFn | AsyncScopeConfigureFn>(configureFn: T): T => {
  return configureFn;
};
