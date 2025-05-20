import { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './impl/Definition.js';

export const value = <TValue>(value: TValue): Definition<TValue, LifeTime.transient> => {
  return new Definition(Symbol(), LifeTime.transient, () => value);
};
