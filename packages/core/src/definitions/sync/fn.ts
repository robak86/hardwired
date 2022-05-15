import { instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { PickExternals } from '../../utils/PickExternals.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { InstanceDefinitionDependency } from '../abstract/sync/InstanceDefinitionDependency.js';

export const fn = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <
    TValue,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K]> },
  >(
    factory: (...args: TArgs) => TValue,
    ...dependencies: TDependencies
  ): InstanceDefinition<TValue, TLifeTime, PickExternals<TDependencies>> => {
    return instanceDefinition({
      strategy,
      dependencies,
      create: context => {
        return factory(...(dependencies.map(context.buildWithStrategy) as TArgs));
      },
    });
  };
};
