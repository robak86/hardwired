import type { IContainer } from '../container/IContainer.js';

import type { IScopeConfigurable } from './abstract/IScopeConfigurable.js';

export type ScopeConfigureFn = (scope: IScopeConfigurable, parent: IContainer) => void;
export type AsyncScopeConfigureFn = (scope: IScopeConfigurable, parent: IContainer) => Promise<void>;

export const configureScope = <T extends ScopeConfigureFn | AsyncScopeConfigureFn>(configureFn: T): T => {
  return configureFn;
};
