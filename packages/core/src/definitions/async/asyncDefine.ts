import { InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { asyncDefinition, AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { ValidDependenciesLifeTime } from '../abstract/sync/InstanceDefinitionDependency.js';

export interface DefineAsyncServiceLocator<TLifeTime extends LifeTime> {
  get<TValue>(instanceDefinition: InstanceDefinition<TValue, ValidDependenciesLifeTime<TLifeTime>>): TValue;

  getAsync<TValue>(
    instanceDefinition: AsyncInstanceDefinition<TValue, ValidDependenciesLifeTime<TLifeTime>>,
  ): Promise<TValue>;

  withNewRequestScope<TValue>(fn: (locator: DefineAsyncServiceLocator<TLifeTime>) => Promise<TValue>): Promise<TValue>;
}

export const asyncDefine = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <TValue>(fn: (locator: DefineAsyncServiceLocator<TLifeTime>) => Promise<TValue>): AsyncInstanceDefinition<TValue, TLifeTime> => {
    // const buildFn = Array.isArray(fnOrExternals) ? fn : fnOrExternals;
    // const externalsArr = Array.isArray(fnOrExternals) ? fnOrExternals : [];

    return asyncDefinition({
      strategy,
      create: async (context: ContainerContext) => {
        const buildLocator = (context: ContainerContext): DefineAsyncServiceLocator<any> => {
          return {
            get: context.buildWithStrategy,
            getAsync: context.buildWithStrategy,
            withNewRequestScope: fn => fn(buildLocator(context.checkoutRequestScope())),
          };
        };

        return fn(buildLocator(context));
      },
    });
  };
};
