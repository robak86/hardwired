import { isServer } from '../utils/isServer.js';

class AsyncLocalStorageMock<T> {
  constructor() {}

  getStore(): T {
    throw new Error('Calling getStore() on mocked AsyncLocalStorage. This is not supported on the browser.');
  }

  run<R, TArgs extends any[]>(store: T, callback: (...args: TArgs) => R, ...args: TArgs): R {
    throw new Error('Calling run() on mocked AsyncLocalStorage. This is not supported on the browser.');
  }
}

export const AsyncLocalStorage = isServer
  ? (await import('node:async_hooks')).AsyncLocalStorage
  : AsyncLocalStorageMock;
