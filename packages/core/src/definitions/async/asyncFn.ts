import { AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition';
import { v4 } from 'uuid';
import { assertNoExternals, pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { AsyncInstanceDefinitionDependency } from '../abstract/async/AsyncInstanceDefinitionDependency';
import { Resolution } from '../abstract/Resolution';

export type AsyncFunctionDefinitionBuildFn<TLifeTime extends LifeTime> = {
  <
    TValue,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: AsyncInstanceDefinitionDependency<TArgs[K]> },
  >(
    factory: (...args: TArgs) => Promise<TValue> | TValue,
    ...args: TDependencies
  ): AsyncInstanceDefinition<TValue, TLifeTime, PickExternals<TDependencies>>;
};

// TODO: for singleton strategy we should not allow passing externals ?
export const asyncFn = <TLifeTime extends LifeTime>(strategy: TLifeTime): AsyncFunctionDefinitionBuildFn<TLifeTime> => {
  return (factory, ...dependencies) => {
    const externals = pickExternals(dependencies);
    assertNoExternals(strategy, externals);

    return {
      id: `${factory.name}:${v4()}`,
      resolution: Resolution.async,
      strategy,
      externals,
      create: async context => {
        const dependenciesInstance = await Promise.all(dependencies.map(context.buildWithStrategy));
        return factory(...(dependenciesInstance as any));
      },
    };
  };
};
