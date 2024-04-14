import { Instance, InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { derivedLifeTime, DerivedLifeTime } from '../utils/DerivedLifeTime.js';

// This definition can be interpreted as a delegator to the actual instances through object getters.
// So it doesn't make sense to have a lifetime of its own. It means that it should always be transient.
// The potential significant disadvantage is creating a new object every time it's requested, where sometimes it could be avoided.
// TODO: potential optimization is to check if all instances are singletons and return a singleton object.

export const object = <T extends Record<keyof any, InstanceDefinition<any, any>>>(
  record: T,
): InstanceDefinition<{ [K in keyof T]: Instance<T[K]> }, DerivedLifeTime<T[keyof T]['strategy']>> => {
  return InstanceDefinition.create(derivedLifeTime(Object.values(record).map(r => r.strategy)) as any, context => {
    return Object.keys(record).reduce((result, property) => {
      result[property] = context.buildWithStrategy(record[property]);
      return result;
    }, {} as any);
  });
};
