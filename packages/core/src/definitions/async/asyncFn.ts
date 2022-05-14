import { asyncDefinition, AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition';
import { PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { AsyncInstanceDefinitionDependency } from '../abstract/async/AsyncInstanceDefinitionDependency';

export const asyncFn = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <
    TValue,
    TParams extends any[],
    TDependencies extends { [K in keyof TParams]: AsyncInstanceDefinitionDependency<TParams[K]> },
  >(
    factory: (...params: TParams) => Promise<TValue> | TValue,
    ...dependencies: TDependencies
  ): AsyncInstanceDefinition<TValue, TLifeTime, PickExternals<TDependencies>> => {
    return asyncDefinition({
      strategy,
      dependencies,
      create: async context => {
        const dependenciesInstance = await Promise.all(dependencies.map(context.buildWithStrategy));
        return factory(...(dependenciesInstance as any));
      },
    });
  };
};
