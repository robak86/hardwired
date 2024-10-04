import { AsyncScopeConfigureFn, ScopeConfigureFn } from '../ScopeConfiguration.js';
import { AsyncContainerConfigureFn, ContainerConfigureFn } from '../ContainerConfiguration.js';
import { DisposableAsyncScopeConfigureFn, DisposableScopeConfigureFn } from '../DisposableScopeConfiguration.js';

export const compose = <T extends ScopeConfigureFn | ContainerConfigureFn | DisposableScopeConfigureFn>(
  ...fns: T[]
): T => {
  return ((...args: [any, any]) => {
    fns.forEach(fn => fn(...args));
  }) as T;
};

export const composeAsync = <
  T extends
    | AsyncScopeConfigureFn
    | AsyncContainerConfigureFn
    | DisposableAsyncScopeConfigureFn
    | ScopeConfigureFn
    | ContainerConfigureFn
    | DisposableScopeConfigureFn,
>(
  ...fns: T[]
): T => {
  return (async (...args: [any, any]) => {
    for (const fn of fns) {
      await fn(...args);
    }
  }) as T;
};
