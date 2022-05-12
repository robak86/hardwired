import { ClassType } from '../../utils/ClassType';
import { AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { AsyncInstanceDefinitionDependency } from '../abstract/async/AsyncInstanceDefinitionDependency';
import { Resolution } from '../abstract/Resolution';
import { v4 } from 'uuid';

export type AsyncClassDefinitionBuildFn<TLifeTime extends LifeTime> = {
  <
    TInstance,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: AsyncInstanceDefinitionDependency<TArgs[K]> },
  >(
    cls: ClassType<TInstance, TArgs>,
    ...args: TDependencies
  ): AsyncInstanceDefinition<TInstance, TLifeTime, PickExternals<TDependencies>>;
};

export const asyncClass = <TLifeTime extends LifeTime>(strategy: TLifeTime): AsyncClassDefinitionBuildFn<TLifeTime> => {
  return (cls, ...dependencies) => {
    return {
      id: `${cls.name}:${v4()}`,
      resolution: Resolution.async,
      strategy,
      externals: pickExternals(dependencies),
      create: async context => {
        const dependenciesInstance = await Promise.all((dependencies as any).map(context.buildWithStrategy));
        return new cls(...(dependenciesInstance as any));
      },
    };
  };
};
