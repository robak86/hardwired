import { instanceDefinition, InstanceDefinition, InstancesArray } from '../abstract/sync/InstanceDefinition.js';
import { derivedLifeTime, DerivedLifeTime } from '../utils/DerivedLifeTime.js';

export const tuple = <T extends Array<InstanceDefinition<any, any>>, TMeta>(
  ...definitions: T
): InstanceDefinition<
  InstancesArray<T>,
  DerivedLifeTime<{ [K in keyof T]: T[K] extends InstanceDefinition<any, infer TLifeTime> ? TLifeTime : never }[number]>
> => {
  const strategy = derivedLifeTime(definitions.map(def => def.strategy)) as any;

  return instanceDefinition({
    strategy,
    create: context => {
      return definitions.map(def => {
        return context.buildWithStrategy(def);
      }) as any;
    },
  });
};
