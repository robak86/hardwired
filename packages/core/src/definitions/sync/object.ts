import { Instance, instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { derivedLifeTime, DerivedLifeTime } from '../utils/DerivedLifeTime.js';

export const object = <T extends Record<keyof any, InstanceDefinition<any, any>>>(
  record: T,
): InstanceDefinition<{ [K in keyof T]: Instance<T[K]> }, DerivedLifeTime<T[keyof T]['strategy']>> => {
  return instanceDefinition({
    strategy: derivedLifeTime(Object.values(record).map(r => r.strategy)) as any,
    create: context => {
      return Object.keys(record).reduce((result, property) => {
        result[property] = context.buildWithStrategy(record[property]);
        return result;
      }, {} as any);
    },
  });
};
