import type { IDefinitionToken, LifeTime, MaybeAsync } from 'hardwired';

import { getCurrentContainer } from './asyncContainerStorage.js';

export function use<TValue>(def: IDefinitionToken<TValue, LifeTime>): MaybeAsync<TValue> {
  return getCurrentContainer().use(def);
}
