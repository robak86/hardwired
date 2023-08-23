import { instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { assertValidDependency, InstanceDefinitionDependency } from '../abstract/sync/InstanceDefinitionDependency.js';

export const serializableFn = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <
    TValue extends object,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K], TLifeTime> },
  >(
    id: string,
    factory: (...args: TArgs) => TValue,
    ...dependencies: TDependencies
  ): InstanceDefinition<TValue, TLifeTime> => {
    assertValidDependency(strategy, dependencies);

    return instanceDefinition({
      id,
      strategy,
      create: context => {
        return factory(...(dependencies.map(context.buildWithStrategy) as TArgs));
      },
      meta: {
        serializable: true,
      },
    });
  };
};
