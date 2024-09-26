import { LifeTime } from '../abstract/LifeTime.js';
import { v4 } from 'uuid';
import { BaseDefinition } from '../abstract/BaseDefinition.js';

export const value = <TValue>(value: TValue): BaseDefinition<TValue, LifeTime.singleton, never, []> => {
  return new BaseDefinition(v4(), LifeTime.singleton, () => value);
};
