import type { ScopeConfigureFn } from 'hardwired';

import { getCurrentContainer, withContainer } from './asyncContainerStorage.js';
import { isServer } from './utils/isServer.js';

export function withScope<T>(...args: Array<ScopeConfigureFn | (() => T)>): T {
  const runFn = args[args.length - 1] as () => T;
  const configurations = args.slice(0, -1) as Array<ScopeConfigureFn>;

  if (!isServer) {
    throw new Error(
      `withScope is not supported on the browser. It requires AsyncLocalStorage that is only available on the NodeJS.`,
    );
  }

  const scope = getCurrentContainer().scope(...configurations);

  return withContainer(scope, runFn);
}
