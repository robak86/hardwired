import type { IDefinitionToken, LifeTime } from 'hardwired';

import { getCurrentContainer } from './asyncContainerStorage.js';

export function use<TValue>(def: IDefinitionToken<TValue, LifeTime>): TValue {
  return getCurrentContainer().use(def);
}

export function useExisting<TValue>(def: IDefinitionToken<TValue, LifeTime>): TValue | null {
  return getCurrentContainer().useExisting(def);
}
