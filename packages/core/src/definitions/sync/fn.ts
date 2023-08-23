import { InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { assertValidDependency, InstanceDefinitionDependency } from '../abstract/sync/InstanceDefinitionDependency.js';

export const fn = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <
    TValue,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K], TLifeTime> },
  >(
    factory: (...args: TArgs) => TValue,
    ...dependencies: TDependencies
  ): InstanceDefinition<TValue, TLifeTime> => {
    assertValidDependency(strategy, dependencies);

    return InstanceDefinition.create(strategy, context => {
      return factory(...(dependencies.map(context.buildWithStrategy) as TArgs));
    });
  };
};
