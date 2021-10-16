import { ClassType } from '../../utils/ClassType';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime} from '../abstract/LifeTime';
import { AllowedSyncDependencies } from '../abstract/AllowedSyncDependencies';
import { Resolution } from "../abstract/Resolution";

type ClassDefinitionBuildFn<TLifeTime extends LifeTime> = {
  <
    TInstance,
    TArgs extends any[],
    TDepsInstances extends { [K in keyof TArgs]: AllowedSyncDependencies<TArgs[K], TLifeTime> },
  >(
    cls: ClassType<TInstance, TArgs>,
    ...args: TDepsInstances
  ): InstanceDefinition<TInstance, TLifeTime, PickExternals<TDepsInstances>>;
};

export const klass = <TLifeTime extends LifeTime>(strategy: TLifeTime): ClassDefinitionBuildFn<TLifeTime> => {
  return (cls, ...dependencies) => {
    return {
      id: v4(),
      resolution: Resolution.sync,
      externals: pickExternals(dependencies),
      strategy,
      create: context => {
        return new cls(...(dependencies.map(context.buildWithStrategy) as any));
      },
      meta: undefined as any,
    };
  };
};
