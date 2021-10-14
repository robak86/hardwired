import { v4 } from 'uuid';
import { TransientStrategy } from '../../strategies/sync/TransientStrategy';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { PickExternals } from '../../utils/PickExternals';
import { UnionToIntersection } from 'type-fest';

export const intersection = <T extends Array<InstanceDefinition<object, any>>, TMeta>(
  ...definitions: T
): InstanceDefinition<
  UnionToIntersection<
    { [K in keyof T]: T[K] extends InstanceDefinition<infer TInstance, any> ? TInstance : unknown }[number]
  >,
  PickExternals<T>
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
    externals: definitions.flatMap(def => def.externals as any) as any, // TODO
    create: context => {
      return definitions.reduce((result, def) => {
        return {
          ...result,
          ...context.buildWithStrategy(def),
        };
      }, {}) as any;
    },
  };
};
