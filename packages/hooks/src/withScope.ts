import { MaybeAsync } from 'hardwired';
import type { HasPromise, ReturnTypes, AsyncScopeConfigureFn, ScopeConfigureFn } from 'hardwired';

import { getCurrentContainer, withContainer } from './asyncContainerStorage.js';
import { isServer } from './utils/isServer.js';

export function withScope<TConfigureFns extends Array<ScopeConfigureFn | AsyncScopeConfigureFn>, T>(
  ...args: [...TConfigureFns, () => T]
): HasPromise<ReturnTypes<TConfigureFns>> extends true ? Promise<T> : T {
  const runFn = args[args.length - 1] as () => T;
  const configurations = args.slice(0, -1) as Array<ScopeConfigureFn>;

  if (!isServer) {
    throw new Error(
      `withScope is not supported on the browser. It requires AsyncLocalStorage that is only available on the NodeJS.`,
    );
  }

  const scope = getCurrentContainer().scope(...configurations);

  return MaybeAsync.resolve(scope)
    .then(awaitedScope => {
      return withContainer(awaitedScope, runFn);
    })
    .unwrap() as HasPromise<ReturnTypes<TConfigureFns>> extends true ? Promise<T> : T;
}
