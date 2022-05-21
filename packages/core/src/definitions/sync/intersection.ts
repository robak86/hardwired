import { instanceDefinition, InstanceDefinition, InstancesArray } from '../abstract/sync/InstanceDefinition.js';
import { PickExternals } from '../../utils/PickExternals.js';
import { derivedLifeTime, DerivedLifeTime } from '../utils/DerivedLifeTime.js';

export type UnionToIntersection<Union> = (Union extends unknown ? (distributedUnion: Union) => void : never) extends (
  mergedIntersection: infer Intersection,
) => void
  ? Intersection
  : never;

export const intersection = <TDefinitions extends Array<InstanceDefinition<object, any, any>>, TMeta>(
  ...definitions: TDefinitions
): InstanceDefinition<
  UnionToIntersection<InstancesArray<TDefinitions>[number]>,
  DerivedLifeTime<
    {
      [K in keyof TDefinitions]: TDefinitions[K] extends InstanceDefinition<any, infer TLifeTime, any>
        ? TLifeTime
        : never;
    }[number]
  >,
  PickExternals<TDefinitions>
> => {
  const strategy = derivedLifeTime(definitions.map(def => def.strategy)) as any;

  return instanceDefinition({
    strategy,
    dependencies: definitions,
    create: context => {
      return definitions.reduce((result, def) => {
        return {
          ...result,
          ...context.buildWithStrategy(def),
        };
      }, {}) as any;
    },
  });
};
