import { MaybeAsync } from '../utils/MaybeAsync.js';

import { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './impl/Definition.js';

export const value = <TValue>(value: TValue): Definition<TValue, LifeTime.transient> => {
  const maybeAsyncValue = MaybeAsync.resolve(value);

  return new Definition(Symbol(), LifeTime.transient, () => {
    return maybeAsyncValue;
  });
};
