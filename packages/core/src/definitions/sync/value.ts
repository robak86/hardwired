import { instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';

export const value = <TValue>(value: TValue): InstanceDefinition<TValue, LifeTime.singleton> => {
  return instanceDefinition({
    strategy: LifeTime.singleton,
    create: () => value,
  });
};
