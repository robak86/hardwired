import { InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';

export const value = <TValue>(value: TValue): InstanceDefinition<TValue, LifeTime.singleton, never> => {
  return InstanceDefinition.create(LifeTime.singleton, () => value, []);
};
