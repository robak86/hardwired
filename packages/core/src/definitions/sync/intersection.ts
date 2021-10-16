import { v4 } from 'uuid';
import { TransientStrategy } from '../../strategies/sync/TransientStrategy';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { UnionToIntersection } from 'type-fest';
import { LifeTime} from '../abstract/LifeTime';
import { DerivedLifeTime } from "../abstract/DerivedLifeTime";
import { Resolution } from "../abstract/Resolution";

export const intersection = <T extends Array<InstanceDefinition<object, any, any>>, TMeta>(
  ...definitions: T
): InstanceDefinition<
  UnionToIntersection<
    { [K in keyof T]: T[K] extends InstanceDefinition<infer TInstance, any, any> ? TInstance : unknown }[number]
  >,
  DerivedLifeTime<
    { [K in keyof T]: T[K] extends InstanceDefinition<any, infer TLifeTime, any> ? TLifeTime : never }[number]
  >,
  PickExternals<T>
> => {
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
    externals: pickExternals(definitions),
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
