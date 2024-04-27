import { AnyInstanceDefinition, container, IContainer, LifeTime } from 'hardwired';
import { AsyncLocalStorage } from './polyfill/async_hooks.js';
import { isServer } from './utils/isServer.js';

export type AsyncLocalStorageValue = {
  container: IContainer | null;
};

declare global {
  interface Window {
    __container?: IContainer;
  }
}

export type DefinitionOverride = AnyInstanceDefinition<any, LifeTime, any>;

const __storage = new AsyncLocalStorage<AsyncLocalStorageValue>();
const __container = container();

export function runWithContainer<T>(container: IContainer, runFn: () => T): T {
  return __storage.run({ container }, runFn);
}

export function hasLocalContainer() {
  return !!__storage.getStore()?.container;
}

export function useContainer(): IContainer {
  if (isServer) {
    const container = __storage.getStore()?.container;

    if (!container) {
      return __container;
    }

    return container;
  } else {
    if (!window.__container) {
      window.__container = __container;
    }

    return window.__container;
  }
}

export const getContainerId = () => useContainer().id;
