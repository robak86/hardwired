import { TransientStrategy } from '../../strategies/sync/TransientStrategy';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';

export const object = <T extends Record<keyof any, InstanceDefinition<any>>, TMeta>(
  record: T,
): InstanceDefinition<
  { [K in keyof T]: T[K] extends InstanceDefinition<infer TInstance> ? TInstance : unknown },
  TMeta
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
    create: build => {
      return Object.keys(record).reduce((result, property) => {
        result[property] = build(record[property]);

        return result;
      }, {} as any);
    },
  };
};
