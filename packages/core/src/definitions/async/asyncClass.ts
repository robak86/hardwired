import { ClassType } from '../../utils/ClassType.js';
import { asyncDefinition, AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { AsyncInstanceDefinitionDependency } from '../abstract/async/AsyncInstanceDefinitionDependency.js';
import { assertValidDependency } from '../abstract/sync/InstanceDefinitionDependency.js';

export const asyncClass = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <
    TInstance,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: AsyncInstanceDefinitionDependency<TArgs[K], TLifeTime> },
  >(
    cls: ClassType<TInstance, TArgs>,
    ...dependencies: TDependencies
  ): AsyncInstanceDefinition<TInstance, TLifeTime> => {
    assertValidDependency(strategy, dependencies);

    return asyncDefinition({
      strategy,
      create: async context => {
        const dependenciesInstance = (await Promise.all(dependencies.map(context.buildWithStrategy))) as TArgs;
        return new cls(...dependenciesInstance);
      },
    });
  };
};
