import { instanceDefinition, InstanceDefinition, InstancesArray } from '../abstract/sync/InstanceDefinition';
import { PickExternals } from '../../utils/PickExternals';
import { UnionToIntersection } from 'type-fest';
import { derivedLifeTime, DerivedLifeTime } from '../utils/DerivedLifeTime';

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
