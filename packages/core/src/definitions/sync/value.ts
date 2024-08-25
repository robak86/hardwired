import { LifeTime } from '../abstract/LifeTime.js';
import { BaseDefinition } from '../abstract/FnDefinition.js';
import { v4 } from 'uuid';

export const value = <TValue>(value: TValue): BaseDefinition<TValue, LifeTime.singleton, never, []> => {
  return new BaseDefinition(v4(), LifeTime.singleton, () => value);
};
