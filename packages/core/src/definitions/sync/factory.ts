import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { LifeTime } from '../abstract/LifeTime';
import { Resolution } from '../abstract/Resolution';
import { FactoryDefinition } from '../abstract/FactoryDefinition';

export type IFactory<TReturn, TParams extends any[], TFactoryMixin = unknown> = {
  build(...params: TParams): TReturn;
} & TFactoryMixin;

// factory is always transient in order to prevent memory leaks if factory definition is created dynamically - each dynamically created factory would create new entry for singleton in instances store
export type FactoryBuildFn = {
  <TInstance, TExternalParams extends any[]>(
    definition: FactoryDefinition<TInstance, any, TExternalParams>,
  ): InstanceDefinition<IFactory<TInstance, TExternalParams>, LifeTime.transient, []>;

  <TInstance, TExternalParams extends any[], TFactoryMixin extends object, TLifeTime extends LifeTime>(
    definition: FactoryDefinition<TInstance, TLifeTime, TExternalParams>,
    factoryMixinDef: InstanceDefinition<TFactoryMixin, TLifeTime>,
  ): InstanceDefinition<IFactory<TInstance, TExternalParams, TFactoryMixin>, LifeTime.transient, []>;
};

export const factory: FactoryBuildFn = (definition, factoryMixingDef?) => {
  return {
    id: v4(),
    strategy: LifeTime.transient as const,
    resolution: Resolution.sync as const,
    externals: [],
    create: (context): IFactory<any, any> => {
      const base = factoryMixingDef ? context.buildWithStrategy(factoryMixingDef) : {};

      return {
        ...base,
        build(...params): any {
          return context.get(definition, ...params);
        },
      };
    },
  };
};
