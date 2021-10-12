import { v4 } from 'uuid';
import { TransientStrategy } from '../../strategies/sync/TransientStrategy';
import { InstanceDefinition } from '../abstract/InstanceDefinition';

export const tuple = <T extends Array<InstanceDefinition<any>>, TMeta>(
  ...definitions: T
): InstanceDefinition<
  { [K in keyof T]: T[K] extends InstanceDefinition<infer TInstance> ? TInstance : unknown },
  TMeta
> => {
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
    create: build => {
      return definitions.map(def => {
        return build(def);
      }) as any;
    },
  };
};
