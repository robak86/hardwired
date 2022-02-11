import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { Resolution } from '../abstract/Resolution';
import { derivedLifeTime, DerivedLifeTime } from '../abstract/DerivedLifeTime';

export const tuple = <T extends Array<InstanceDefinition<any, any, any>>, TMeta>(
  ...definitions: T
): InstanceDefinition<
  { [K in keyof T]: T[K] extends InstanceDefinition<infer TInstance, any> ? TInstance : unknown },
  DerivedLifeTime<
    { [K in keyof T]: T[K] extends InstanceDefinition<any, infer TLifeTime, any> ? TLifeTime : never }[number]
  >,
  PickExternals<T>
> => {
  const strategy = derivedLifeTime(definitions.map(def => def.strategy)) as any;

  return new InstanceDefinition({
    strategy,
    externals: pickExternals(definitions),
    create: context => {
      return definitions.map(def => {
        return context.buildWithStrategy(def);
      }) as any;
    },
  });
};
