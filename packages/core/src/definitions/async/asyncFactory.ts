import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';
import { Resolution } from '../abstract/Resolution';

export type IAsyncFactory<TReturn, TParams extends any[], TFactoryMixin = unknown> = {
  build(...params: TParams): Promise<TReturn>;
} & TFactoryMixin;

export type AsyncFactoryBuildFn = {
  <TInstance, TParams extends any[]>(definition: AnyInstanceDefinition<TInstance, any, TParams>): InstanceDefinition<
    IAsyncFactory<TInstance, TParams>,
    LifeTime.transient,
    []
  >;

  <TInstance, TParams extends any[], TFactoryMixin extends object, TLifeTime extends LifeTime>(
    definition: AnyInstanceDefinition<TInstance, any, TParams>,
    factoryMixinDef: InstanceDefinition<TFactoryMixin, TLifeTime, []>,
  ): InstanceDefinition<IAsyncFactory<TInstance, TParams, TFactoryMixin>, TLifeTime, []>;
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
