import type { DisposableScopeConfigurable } from './abstract/ScopeConfigurable.js';
import type { ConfigurationContainer } from './ContainerConfiguration.js';

export type DisposableScopeConfigureFn = (scope: DisposableScopeConfigurable, parent: ConfigurationContainer) => void;
export type DisposableAsyncScopeConfigureFn = (
  scope: DisposableScopeConfigurable,
  parent: ConfigurationContainer,
) => Promise<void>;

export const configureDisposable = <T extends DisposableScopeConfigureFn | DisposableAsyncScopeConfigureFn>(
  configureFn: T,
): T => {
  return configureFn;
};
