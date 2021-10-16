import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { AsyncSingletonStrategy } from '../../strategies/async/AsyncSingletonStrategy';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime} from '../abstract/LifeTime';
import { Resolution } from "../abstract/Resolution";

export type AsyncFunctionDefinitionBuildFn<TLifeTime extends LifeTime> = {
  <
    TValue,
    TFunctionArgs extends any[],
    TDeps extends { [K in keyof TFunctionArgs]: AnyInstanceDefinition<TFunctionArgs[K], any, any> },
  >(
    factory: (...args: TFunctionArgs) => Promise<TValue>,
    ...args: TDeps
  ): AsyncInstanceDefinition<TValue, TLifeTime, PickExternals<TDeps>>;
};

export const asyncFn = <TLifeTime extends LifeTime>(strategy: TLifeTime): AsyncFunctionDefinitionBuildFn<TLifeTime> => {
  return (factory, ...dependencies) => {
    return {
      id: `${factory.name}:${v4()}`,
      strategy,
      resolution: Resolution.async,
      externals: pickExternals(dependencies),
      create: async context => {
        const dependenciesInstance = await Promise.all(dependencies.map(context.buildWithStrategy));
        return factory(...(dependenciesInstance as any));
      },

      meta: undefined,
    };
  };
};
