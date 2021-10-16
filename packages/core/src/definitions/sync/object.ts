import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals } from '../../utils/PickExternals';
import { LifeTime} from '../abstract/LifeTime';
import { DerivedLifeTime } from "../abstract/DerivedLifeTime";
import { Resolution } from "../abstract/Resolution";

export const object = <T extends Record<keyof any, InstanceDefinition<any, any, []>>>(
  record: T,
): InstanceDefinition<
  { [K in keyof T]: T[K] extends InstanceDefinition<infer TInstance, any, any> ? TInstance : unknown },
  DerivedLifeTime<
    { [K in keyof T]: T[K] extends InstanceDefinition<any, infer TLifeTime, any> ? TLifeTime : never }[keyof T]
  >,
  []
  // due to typescript limitations there is no way to correctly infer externals from record.
  // Order of the record properties is not guaranteed therefore the order of externals in tuple cannot be guaranteed
  // (Object.values(...) may return values in different order than mapped type
  // TODO: alternatively object may accept record of InstanceDefinition which the same externals tuple
> => {
  const definitions = Object.values(record);
  const firstStrategy = definitions[0]?.strategy;

  const strategy = firstStrategy
    ? definitions.every(def => def.strategy === firstStrategy)
      ? firstStrategy
      : LifeTime.transient
    : LifeTime.transient; // empty record

  return {
    id: v4(),
    strategy,
    resolution: Resolution.sync,
    externals: pickExternals(Object.values(record)),
    create: context => {
      return Object.keys(record).reduce((result, property) => {
        result[property] = context.buildWithStrategy(record[property]);

        return result;
      }, {} as any);
    },
  };
};
