import type { ContainerConfiguration, ScopeConfigureFn } from 'hardwired';

import { withContainer, getCurrentContainer } from './asyncContainerStorage.js';
import { isServer } from './utils/isServer.js';

export function withScope<T>(runFn: () => T): T;
export function withScope<T>(configs: Array<ContainerConfiguration | ScopeConfigureFn>, runFn: () => T): T;
export function withScope<T>(
  configsOrRunFs: Array<ContainerConfiguration | ScopeConfigureFn> | (() => T),
  runFn?: () => T,
): T {
  const configurations = (runFn ? configsOrRunFs : []) as Array<ContainerConfiguration | ScopeConfigureFn>;
  const run = (runFn || configsOrRunFs) as () => T;

  if (!isServer) {
    throw new Error(
      `withScope is not supported on the browser. It requires AsyncLocalStorage that is only available on the NodeJS.`,
    );
  }

  const scope = getCurrentContainer().scope(...configurations);

  return withContainer(scope, run);
}
