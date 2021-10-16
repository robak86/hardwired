import { ClassType } from '../../utils/ClassType';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { Resolution } from '../abstract/Resolution';
import { InstanceDefinitionDependency } from '../abstract/InstanceDefinitionDependency';

type ClassDefinitionBuildFn<TLifeTime extends LifeTime> = {
  <
    TInstance,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K], TLifeTime> },
  >(
    cls: ClassType<TInstance, TArgs>,
    ...args: TDependencies
  ): AsyncInstanceDefinition<TInstance, TLifeTime, PickExternals<TDependencies>>;
};

export const asyncClass = <TLifeTime extends LifeTime>(strategy: TLifeTime): ClassDefinitionBuildFn<TLifeTime> => {
  return (cls, ...dependencies) => {
    return {
      id: v4(),
      strategy,
      resolution: Resolution.async,
      externals: pickExternals(dependencies),
      create: async context => {
        const dependenciesInstance = await Promise.all((dependencies as any).map(context.buildWithStrategy));
        return new cls(...(dependenciesInstance as any));
      },
      meta: undefined,
    };
  };
};
