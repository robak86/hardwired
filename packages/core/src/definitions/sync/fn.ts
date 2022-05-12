import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { InstanceDefinitionDependency } from '../abstract/sync/InstanceDefinitionDependency';
import { Resolution } from '../abstract/Resolution';

export type FunctionDefinitionBuildFn<TLifeTime extends LifeTime> = {
  <TValue, TArgs extends any[], TDependencies extends { [K in keyof TArgs]: InstanceDefinitionDependency<TArgs[K]> }>(
    factory: (...args: TArgs) => TValue,
    ...args: TDependencies
  ): InstanceDefinition<TValue, TLifeTime, PickExternals<TDependencies>>;
};

export const fn = <TLifeTime extends LifeTime>(strategy: TLifeTime): FunctionDefinitionBuildFn<TLifeTime> => {
  return (factory, ...dependencies) => {
    return {
      id: `${factory.name}:${v4()}`,
      resolution: Resolution.sync,
      strategy,
      externals: pickExternals(dependencies),
      create: context => {
        return factory(...(dependencies.map(context.buildWithStrategy) as any));
      },
    };
  };
};
