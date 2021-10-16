import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { LifeTime } from '../abstract/LifeTime';
import { Resolution } from '../abstract/Resolution';

export type IFactory<TReturn, TParams extends any[], TFactoryMixin = unknown> = {
  build(...params: TParams): TReturn;
} & TFactoryMixin;

export type FactoryBuildFn = {
  <TInstance, TExternalParams extends any[]>(
    definition: InstanceDefinition<TInstance, any, TExternalParams>,
  ): InstanceDefinition<IFactory<TInstance, TExternalParams>, LifeTime.singleton, []>;

  <TInstance, TExternalParams extends any[], TFactoryMixin extends object, TLifeTime extends LifeTime>(
    definition: InstanceDefinition<TInstance, TLifeTime, TExternalParams>,
    factoryMixinDef: InstanceDefinition<TFactoryMixin, TLifeTime>,
  ): InstanceDefinition<IFactory<TInstance, TExternalParams, TFactoryMixin>, TLifeTime, []>;
};

export const factory: FactoryBuildFn = (definition, factoryMixingDef?) => {
  const strategy = factoryMixingDef ? factoryMixingDef.strategy : LifeTime.singleton;

  return {
    id: v4(),
    strategy,
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
