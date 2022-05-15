import { instanceDefinition, InstanceDefinition, InstancesArray } from '../abstract/sync/InstanceDefinition.js';
import { PickExternals } from '../../utils/PickExternals.js';
import { derivedLifeTime, DerivedLifeTime } from '../utils/DerivedLifeTime.js';

export const tuple = <T extends Array<InstanceDefinition<any, any, any>>, TMeta>(
  ...definitions: T
): InstanceDefinition<
  InstancesArray<T>,
  DerivedLifeTime<
    { [K in keyof T]: T[K] extends InstanceDefinition<any, infer TLifeTime, any> ? TLifeTime : never }[number]
  >,
  PickExternals<T>
> => {
  const strategy = derivedLifeTime(definitions.map(def => def.strategy)) as any;

  return instanceDefinition({
    strategy,
    dependencies: definitions,
    create: context => {
      return definitions.map(def => {
        return context.buildWithStrategy(def);
      }) as any;
    },
  });
};
