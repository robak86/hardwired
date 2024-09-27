import { LifeTime } from '../abstract/LifeTime.js';
import { v4 } from 'uuid';
import { Definition } from '../abstract/Definition.js';

export const value = <TValue>(value: TValue): Definition<TValue, LifeTime.singleton, []> => {
  return new Definition(v4(), LifeTime.singleton, () => value);
};
