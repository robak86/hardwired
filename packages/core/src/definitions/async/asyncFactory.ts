import { InstanceDefinition, InstancesArray } from '../abstract/sync/InstanceDefinition.js';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import {
  InstanceDefinitionDependency,
  ValidDependenciesLifeTime,
} from '../abstract/sync/InstanceDefinitionDependency.js';
import { set } from '../../patching/set.js';

export type IAsyncFactory<TReturn, TParams extends any[]> = {
  build(...params: TParams): Promise<TReturn>;
};

export type AsyncFactoryBuildFn = {
  <
    TInstance,
    TExternalParams,
    TLifeTime extends LifeTime,
    TDependencies extends InstanceDefinitionDependency<any, ValidDependenciesLifeTime<TLifeTime>>[],
  >(
    definition: AnyInstanceDefinition<TInstance, TLifeTime, any>,
    ...dependencies: TDependencies
  ): InstanceDefinition<IAsyncFactory<TInstance, InstancesArray<TDependencies>>, LifeTime.transient, unknown>;
};

export const asyncFactory: AsyncFactoryBuildFn = (
  definition: any,
  ...dependencies: InstanceDefinition<any, any, unknown>[]
): any => {
  return InstanceDefinition.create(
    LifeTime.transient,
    (context: ContainerContext): IAsyncFactory<any, any> => {
      // const base = factoryMixingDef ? context.buildWithStrategy(factoryMixingDef) : {};

      return {
        // ...base,
        build(...params): any {
          if (params.length !== dependencies.length) {
            throw new Error(
              `Factory called with wrong count of params. Expected ${dependencies.length} implicit definitions.`,
            );
          }

          const scopedContext = context.checkoutScope({
            overrides: dependencies.map((dep, idx) => set(dep, params[idx])),
          });
          return scopedContext.use(definition);
        },
      };
    },
    dependencies,
  );
};
