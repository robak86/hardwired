import { MaybeAsync } from '../utils/MaybeAsync.js';

import type { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './impl/Definition.js';
import { transient } from './def-symbol.js';

export const value = <TValue>(value: TValue): Definition<TValue, LifeTime.transient> => {
  const maybeAsyncValue = MaybeAsync.resolve(value);

  return new Definition(transient<TValue>(), () => {
    return maybeAsyncValue;
  });
};
