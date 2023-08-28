import { InstanceDefinition, InstancesArray } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import {
  InstanceDefinitionDependency,
  ValidDependenciesLifeTime,
} from '../abstract/sync/InstanceDefinitionDependency.js';
import { set } from '../../patching/set.js';

// prettier-ignore
export type FactoryDefinition<TValue> =
    | InstanceDefinition<TValue, LifeTime.singleton>
    | InstanceDefinition<TValue, LifeTime.transient>
    | InstanceDefinition<TValue, LifeTime.scoped>

export type IFactory<TReturn, TParams extends any[]> = {
  build(...params: TParams): TReturn;
};

export type FactoryBuildFn = {
  <
    TInstance,
    TLifeTime extends LifeTime,
    TDependencies extends InstanceDefinitionDependency<any, ValidDependenciesLifeTime<TLifeTime>>[],
  >(
    definition: FactoryDefinition<TInstance>,
    ...dependencies: TDependencies
  ): InstanceDefinition<IFactory<TInstance, InstancesArray<TDependencies>>, LifeTime.transient>;
};

// export const factory: FactoryBuildFn = (definition: any, factoryMixingDef?: any): any => {
export const factory: FactoryBuildFn = (definition: any, ...dependencies: InstanceDefinition<any, any>[]): any => {
  return InstanceDefinition.create(LifeTime.transient, (context: ContainerContext): IFactory<any, any> => {
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
        return scopedContext.get(definition);
      },
    };
  });
};
