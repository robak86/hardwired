import type { IDefinitionToken, LifeTime, ModifyDefinitionBuilder } from 'hardwired';

import { getCurrentContainer } from './asyncContainerStorage.js';

export const freeze = <TInstance>(
  definition: IDefinitionToken<TInstance, LifeTime>,
): ModifyDefinitionBuilder<TInstance, LifeTime> => {
  return getCurrentContainer().freeze(definition);
};
