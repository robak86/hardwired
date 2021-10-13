import { TransientStrategy } from '../../strategies/sync/TransientStrategy';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { PickExternalsFromRecord } from '../../utils/PickExternals';

export const object = <T extends Record<keyof any, InstanceDefinition<any>>>(
  record: T,
): InstanceDefinition<
  { [K in keyof T]: T[K] extends InstanceDefinition<infer TInstance> ? TInstance : unknown },
  PickExternalsFromRecord<T>
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
    externalsIds: Object.values(record).flatMap(def => def.externalsIds),
    create: context => {
      return Object.keys(record).reduce((result, property) => {
        result[property] = context.buildWithStrategy(record[property]);

        return result;
      }, {} as any);
    },
  };
};
