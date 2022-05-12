import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';
import { Resolution } from '../abstract/Resolution';
import { v4 } from 'uuid';

export const value = <TValue>(value: TValue): InstanceDefinition<TValue, LifeTime.singleton, never> => {
  return {
    id: v4(),
    resolution: Resolution.sync,
    externals: {} as never,
    strategy: LifeTime.singleton,
    create: () => value,
  };
};
