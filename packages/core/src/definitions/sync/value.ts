import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';

export const value = <TValue, TDeps extends any[]>(
  value: TValue,
): InstanceDefinition<TValue, LifeTime.singleton, []> => {
  return new InstanceDefinition({
    externals: [],
    strategy: LifeTime.singleton,
    create: () => value,
  });
};
