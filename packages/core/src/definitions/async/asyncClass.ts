import { ClassType } from '../../utils/ClassType';
import { asyncDefinition, AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition';
import { PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { AsyncInstanceDefinitionDependency } from '../abstract/async/AsyncInstanceDefinitionDependency';

export const asyncClass = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <
    TInstance,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: AsyncInstanceDefinitionDependency<TArgs[K]> },
  >(
    cls: ClassType<TInstance, TArgs>,
    ...dependencies: TDependencies
  ): AsyncInstanceDefinition<TInstance, TLifeTime, PickExternals<TDependencies>> => {
    return asyncDefinition({
      strategy,
      dependencies,
      create: async context => {
        const dependenciesInstance = await Promise.all((dependencies as any).map(context.buildWithStrategy));
        return new cls(...(dependenciesInstance as any));
      },
    });
  };
};
