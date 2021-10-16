import { v4 } from 'uuid';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { UnionToIntersection } from 'type-fest';
import { derivedLifeTime, DerivedLifeTime } from '../abstract/DerivedLifeTime';
import { Resolution } from '../abstract/Resolution';

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
  const strategy = derivedLifeTime(definitions.map(def => def.strategy)) as any;

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
