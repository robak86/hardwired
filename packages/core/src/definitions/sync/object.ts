import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { pickExternals } from '../../utils/PickExternals';
import { derivedLifeTime, DerivedLifeTime } from '../utils/DerivedLifeTime';
import { Resolution } from "../abstract/Resolution";
import { v4 } from "uuid";

export const object = <T extends Record<keyof any, InstanceDefinition<any, any, never>>>(
  record: T,
): InstanceDefinition<
  { [K in keyof T]: T[K] extends InstanceDefinition<infer TInstance, any, any> ? TInstance : unknown },
  DerivedLifeTime<
    { [K in keyof T]: T[K] extends InstanceDefinition<any, infer TLifeTime, any> ? TLifeTime : never }[keyof T]
  >,
  never // TODO: set correct externals type
> => {
  const strategy = derivedLifeTime(Object.values(record).map(r => r.strategy)) as any;

  return {
    id: v4(),
    resolution: Resolution.sync,
    strategy,
    externals: pickExternals(Object.values(record)),
    create: context => {
      return Object.keys(record).reduce((result, property) => {
        result[property] = context.buildWithStrategy(record[property]);

        return result;
      }, {} as any);
    },
  };
};
