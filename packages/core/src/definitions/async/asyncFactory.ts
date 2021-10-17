import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';
import { Resolution } from '../abstract/Resolution';
import { AsyncFactoryDefinition } from '../abstract/AsyncFactoryDefinition';

export type IAsyncFactory<TReturn, TParams extends any[], TFactoryMixin = unknown> = {
  build(...params: TParams): Promise<TReturn>;
} & TFactoryMixin;

export type AsyncFactoryBuildFn = {
  <TInstance, TExternalParams extends any[]>(
    definition: AsyncFactoryDefinition<TInstance, any, TExternalParams>,
  ): InstanceDefinition<IAsyncFactory<TInstance, TExternalParams>, LifeTime.transient, []>;

  <TInstance, TExternalParams extends any[], TFactoryMixin extends object, TLifeTime extends LifeTime>(
    definition: AsyncFactoryDefinition<TInstance, any, TExternalParams>,
    factoryMixinDef: InstanceDefinition<TFactoryMixin, TLifeTime, []>,
  ): InstanceDefinition<IAsyncFactory<TInstance, TExternalParams, TFactoryMixin>, TLifeTime, []>;
};

export const asyncFactory: AsyncFactoryBuildFn = (
  definition: AnyInstanceDefinition<any, any, any>,
  factoryMixingDef?,
) => {
  const strategy = factoryMixingDef ? factoryMixingDef.strategy : LifeTime.singleton;

  return {
    id: v4(),
    strategy,
    resolution: Resolution.sync as const,
    externals: [],
    create: (context): IAsyncFactory<any, any> => {
      const base = factoryMixingDef ? context.buildWithStrategy(factoryMixingDef) : {};

      return {
        ...base,
        build(...params): any {
          return context.getAsync(definition, ...params);
        },
      };
    },
  };
};
