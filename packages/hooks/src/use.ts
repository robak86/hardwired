import type { IDefinitionToken, LifeTime } from 'hardwired';

import { getCurrentContainer } from './asyncContainerStorage.js';

export function use<TValue>(def: IDefinitionToken<TValue, LifeTime>): TValue {
  return getCurrentContainer().use(def).trySync();
}

export function useAsync<TValue>(def: IDefinitionToken<TValue, LifeTime>): Promise<TValue> {
  return Promise.resolve(getCurrentContainer().use(def));
}
