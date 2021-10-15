import { TransientStrategy } from '../../strategies/sync/TransientStrategy';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals } from '../../utils/PickExternals';

export const object = <T extends Record<keyof any, InstanceDefinition<any, []>>>(
  record: T,
): InstanceDefinition<
  { [K in keyof T]: T[K] extends InstanceDefinition<infer TInstance, any> ? TInstance : unknown },
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
      : TransientStrategy.type
    : TransientStrategy.type; // empty record

  return {
    id: v4(),
    strategy,
    isAsync: false,
    externals: pickExternals(Object.values(record)),
    create: context => {
      return Object.keys(record).reduce((result, property) => {
        result[property] = context.buildWithStrategy(record[property]);

        return result;
      }, {} as any);
    },
  };
};
