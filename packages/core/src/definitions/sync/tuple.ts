import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { Resolution } from '../abstract/Resolution';
import { derivedLifeTime, DerivedLifeTime } from '../utils/DerivedLifeTime';
import { v4 } from "uuid";

export const tuple = <T extends Array<InstanceDefinition<any, any, any>>, TMeta>(
  ...definitions: T
): InstanceDefinition<
  { [K in keyof T]: T[K] extends InstanceDefinition<infer TInstance, any, never> ? TInstance : unknown },
  DerivedLifeTime<
    { [K in keyof T]: T[K] extends InstanceDefinition<any, infer TLifeTime, any> ? TLifeTime : never }[number]
  >,
  PickExternals<T>
> => {
  const strategy = derivedLifeTime(definitions.map(def => def.strategy)) as any;

  return {
    id: v4(),
    resolution: Resolution.sync,
    strategy,
    externals: pickExternals(definitions),
    create: context => {
      return definitions.map(def => {
        return context.buildWithStrategy(def);
      }) as any;
    },
  };
};
