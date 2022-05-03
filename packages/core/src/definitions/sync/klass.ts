import { ClassType } from '../../utils/ClassType';
import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { InstanceDefinitionDependency } from '../abstract/sync/InstanceDefinitionDependency';

export type ClassDefinitionBuildFn<TLifeTime extends LifeTime> = {
  <
    TInstance,
    TArgs extends any[],
    TDependencies extends { [K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K]> },
  >(
    cls: ClassType<TInstance, TArgs>,
    ...args: TDependencies
  ): InstanceDefinition<
    TInstance,
    TLifeTime,
    PickExternals<TDependencies> extends any[] ? PickExternals<TDependencies> : []
  >;
};

export const klass = <TLifeTime extends LifeTime>(strategy: TLifeTime): ClassDefinitionBuildFn<TLifeTime> => {
  return (cls, ...dependencies) => {
    return new InstanceDefinition({
      externals: pickExternals(dependencies),
      strategy,
      create: context => {
        return new cls(...(dependencies.map(context.buildWithStrategy) as any));
      },
    });
  };
};
