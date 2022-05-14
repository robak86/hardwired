import { instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';

export const value = <TValue>(value: TValue): InstanceDefinition<TValue, LifeTime.singleton, never> => {
  return instanceDefinition({
    strategy: LifeTime.singleton,
    dependencies: [],
    create: () => value,
  });
};
