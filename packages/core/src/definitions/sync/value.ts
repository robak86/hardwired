import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { LifeTime, Resolution } from '../abstract/LifeTime';

export const value = <TValue, TDeps extends any[]>(
  value: TValue,
): InstanceDefinition<TValue, LifeTime.singleton, []> => {
  return {
    id: v4(),
    resolution: Resolution.sync,
    externals: [],
    strategy: LifeTime.singleton,
    create: () => value,
  };
};
