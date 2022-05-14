import { Instance, instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { derivedLifeTime, DerivedLifeTime } from '../utils/DerivedLifeTime';

export const object = <T extends Record<keyof any, InstanceDefinition<any, any, never>>>(
  record: T,
): InstanceDefinition<{ [K in keyof T]: Instance<T[K]> }, DerivedLifeTime<T[keyof T]['strategy']>, never> => {
  return instanceDefinition({
    strategy: derivedLifeTime(Object.values(record).map(r => r.strategy)) as any,
    dependencies: Object.values(record),
    create: context => {
      return Object.keys(record).reduce((result, property) => {
        result[property] = context.buildWithStrategy(record[property]);
        return result;
      }, {} as any);
    },
  });
};
