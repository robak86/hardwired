import type { AsyncScopeConfigureFn, ScopeConfigureFn } from '../ScopeConfiguration.js';
import type { AsyncContainerConfigureFn, ContainerConfigureFn } from '../ContainerConfiguration.js';

export const compose = <T extends ScopeConfigureFn | ContainerConfigureFn>(...fns: T[]): T => {
  return ((...args: [any, any]) => {
    fns.forEach(fn => fn(...args));
  }) as T;
};

export const composeAsync = <
  T extends AsyncScopeConfigureFn | AsyncContainerConfigureFn | ScopeConfigureFn | ContainerConfigureFn,
>(
  ...fns: T[]
): T => {
  return (async (...args: [any, any]) => {
    for (const fn of fns) {
      await fn(...args);
    }
  }) as T;
};
