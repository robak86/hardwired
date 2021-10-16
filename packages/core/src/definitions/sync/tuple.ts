import { v4 } from 'uuid';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime} from '../abstract/LifeTime';
import { Resolution } from "../abstract/Resolution";

export const tuple = <T extends Array<InstanceDefinition<any, any, any>>, TMeta>(
  ...definitions: T
): InstanceDefinition<
  { [K in keyof T]: T[K] extends InstanceDefinition<infer TInstance, any> ? TInstance : unknown },
  LifeTime.transient,
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
      return definitions.map(def => {
        return context.buildWithStrategy(def);
      }) as any;
    },
  };
};
