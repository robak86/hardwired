import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';
import { Resolution } from '../abstract/Resolution';

export const value = <TValue, TDeps extends any[]>(
  value: TValue,
): InstanceDefinition<TValue, LifeTime.singleton, []> => {
  return new InstanceDefinition({
    externals: [],
    strategy: LifeTime.singleton,
    create: () => value,
  });
};
