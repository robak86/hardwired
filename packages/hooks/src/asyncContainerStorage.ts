import { IContainer } from 'hardwired';

import { isServer } from './utils/isServer.js';
import { AsyncLocalStorage } from 'node:async_hooks';

export type AsyncLocalStorageValue = {
  container: IContainer | null;
};

declare global {
  interface Window {
    __container?: IContainer;
  }
}

const __storage = new AsyncLocalStorage<AsyncLocalStorageValue>();

export function withContainer<T>(container: IContainer, runFn: () => T): T {
  return __storage.run({ container }, runFn);
}

export function getCurrentContainer(): IContainer {
  if (isServer) {
    const container = __storage.getStore()?.container;

    if (!container) {
      throw new Error(
        "No container found in the current async context. Make sure to use 'withContainer' to run your code within a container context.",
      );
    }

    return container;
  } else {
    throw new Error('Not implemented');
    // if (!window.__container) {
    //   window.__container = __container;
    // }
    //
    // return window.__container;
  }
}
