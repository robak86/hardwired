import { ScopeConfigureFn } from '../ScopeConfiguration.js';
import { ContainerConfigureFn } from '../ContainerConfiguration.js';

export const compose = <T extends ScopeConfigureFn | ContainerConfigureFn>(...fns: T[]): T => {
  return ((...args: [any, any]) => {
    fns.forEach(fn => fn(...args));
  }) as T;
};
