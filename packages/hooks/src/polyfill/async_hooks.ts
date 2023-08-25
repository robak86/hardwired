import { isServer } from '../utils/isServer.js';

class AsyncLocalStorageMock {
  static readonly notSupported = true;
  constructor() {
    console.log('creating polyfill');
  }
  getStore() {
    console.error('Calling getStore() on mocked AsyncLocalStorage. This is not supported on the browser.');
  }
}

export const AsyncLocalStorage = isServer
  ? (await import('node:async_hooks')).AsyncLocalStorage
  : AsyncLocalStorageMock;
