import { TransientStrategy } from '../../strategies/sync/TransientStrategy';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { PickExternalsFromRecord } from '../../utils/PickExternals';

export const object = <T extends Record<keyof any, InstanceDefinition<any, any>>>(
  record: T,
): InstanceDefinition<
  { [K in keyof T]: T[K] extends InstanceDefinition<infer TInstance, any> ? TInstance : unknown },
  []
  //PickExternalsFromRecord<T> TODO
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
    externals: Object.values(record).flatMap(def => def.externals as any) as any,
    create: context => {
      return Object.keys(record).reduce((result, property) => {
        result[property] = context.buildWithStrategy(record[property]);

        return result;
      }, {} as any);
    },
  };
};
