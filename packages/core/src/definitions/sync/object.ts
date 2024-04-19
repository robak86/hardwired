import { Instance, InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { derivedLifeTime, DerivedLifeTime } from '../utils/DerivedLifeTime.js';

// TODO: it could create a proxy object that would lazily build the instances
export const object = <T extends Record<keyof any, InstanceDefinition<any, any>>>(
  record: T,
): InstanceDefinition<{ [K in keyof T]: Instance<T[K]> }, DerivedLifeTime<T[keyof T]['strategy']>> => {
  return InstanceDefinition.create(
    derivedLifeTime(Object.values(record).map(r => r.strategy)) as any,
    context => {
      return Object.keys(record).reduce((result, property) => {
        result[property] = context.buildWithStrategy(record[property]);
        return result;
      }, {} as any);
    },
    Object.values(record).flatMap(def => def.dependencies),
  );
};
