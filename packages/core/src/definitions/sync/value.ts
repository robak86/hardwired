import { LifeTime } from '../abstract/LifeTime.js';
import { Definition } from '../abstract/Definition.js';

export const value = <TValue>(value: TValue): Definition<TValue, LifeTime.singleton, []> => {
  return new Definition(Symbol(), LifeTime.singleton, () => value);
};
