import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { SingletonStrategy } from '../../strategies/sync/SingletonStrategy';
import { v4 } from 'uuid';

export const value = <TValue, TDeps extends any[]>(value: TValue): InstanceDefinition<TValue> => {
  return {
    id: v4(),
    strategy: SingletonStrategy.type,
    create: () => value,
  };
};
