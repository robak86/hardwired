import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { Resolution } from '../abstract/Resolution';
import { AsyncInstanceDefinitionDependency } from '../abstract/AsyncInstanceDefinitionDependency';

export type AsyncFunctionDefinitionBuildFn<TLifeTime extends LifeTime> = {
  <
    TValue,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: AsyncInstanceDefinitionDependency<TArgs[K], TLifeTime> },
  >(
    factory: (...args: TArgs) => Promise<TValue> | TValue,
    ...args: TDependencies
  ): AsyncInstanceDefinition<TValue, TLifeTime, PickExternals<TDependencies>>;
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
