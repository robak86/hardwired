import { asyncDefinition, AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition.js';

import { LifeTime } from '../abstract/LifeTime.js';
import { AsyncInstanceDefinitionDependency } from '../abstract/async/AsyncInstanceDefinitionDependency.js';
import { assertValidDependency } from '../abstract/sync/InstanceDefinitionDependency.js';

export const asyncFn = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <
    TValue,
    TParams extends any[],
    TDependencies extends { [K in keyof TParams]: AsyncInstanceDefinitionDependency<TParams[K], TLifeTime> },
  >(
    factory: (...params: TParams) => Promise<TValue> | TValue,
    ...dependencies: TDependencies
  ): AsyncInstanceDefinition<TValue, TLifeTime> => {
    assertValidDependency(strategy, dependencies);

    return asyncDefinition({
      strategy,
      create: async context => {
        const dependenciesInstance = await Promise.all(dependencies.map(context.buildWithStrategy));
        return factory(...(dependenciesInstance as any));
      },
      dependencies,
    });
  };
};
