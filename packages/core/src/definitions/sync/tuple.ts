import { instanceDefinition, InstanceDefinition, InstancesArray } from '../abstract/sync/InstanceDefinition';
import { PickExternals } from '../../utils/PickExternals';
import { derivedLifeTime, DerivedLifeTime } from '../utils/DerivedLifeTime';

export const tuple = <TDefinitions extends Array<InstanceDefinition<any, any, any>>, TMeta>(
  ...definitions: TDefinitions
): InstanceDefinition<
  InstancesArray<TDefinitions>,
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
      return definitions.map(def => {
        return context.buildWithStrategy(def);
      }) as any;
    },
  });
};
