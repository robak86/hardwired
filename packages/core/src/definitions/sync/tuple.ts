import { InstanceDefinition, InstancesArray } from '../abstract/sync/InstanceDefinition.js';
import { derivedLifeTime, DerivedLifeTime } from '../utils/DerivedLifeTime.js';

export const tuple = <T extends Array<InstanceDefinition<any, any, any>>, TMeta>(
  ...definitions: T
): InstanceDefinition<
  InstancesArray<T>,
  DerivedLifeTime<
    { [K in keyof T]: T[K] extends InstanceDefinition<any, infer TLifeTime, any> ? TLifeTime : never }[number]
  >,
  unknown
> => {
  const strategy = derivedLifeTime(definitions.map(def => def.strategy)) as any;

  return InstanceDefinition.create(
    strategy,
    context => {
      return definitions.map(def => {
        return context.use(def);
      }) as any;
    },
    definitions.flatMap(def => def.dependencies),
  );
};
