import { ClassType } from '../../utils/ClassType';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { AsyncInstanceDefinitionDependency } from '../abstract/AsyncInstanceDefinitionDependency';

export type AsyncClassDefinitionBuildFn<TLifeTime extends LifeTime> = {
  <
    TInstance,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: AsyncInstanceDefinitionDependency<TArgs[K], TLifeTime> },
  >(
    cls: ClassType<TInstance, TArgs>,
    ...args: TDependencies
  ): AsyncInstanceDefinition<TInstance, TLifeTime, PickExternals<TDependencies>>;
};

export const asyncClass = <TLifeTime extends LifeTime>(strategy: TLifeTime): AsyncClassDefinitionBuildFn<TLifeTime> => {
  return (cls, ...dependencies) => {
    return new AsyncInstanceDefinition({
      strategy,
      externals: pickExternals(dependencies),
      create: async context => {
        const dependenciesInstance = await Promise.all((dependencies as any).map(context.buildWithStrategy));
        return new cls(...(dependenciesInstance as any));
      },
    });
  };
};
