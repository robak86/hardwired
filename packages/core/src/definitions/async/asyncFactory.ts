import { InstanceDefinition } from '../abstract/base/InstanceDefinition';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';
import { AsyncFactoryDefinition } from '../abstract/AsyncFactoryDefinition';
import { ContainerContext } from "../../context/ContainerContext";

export type IAsyncFactory<TReturn, TParams extends any[], TFactoryMixin = unknown> = {
  build(...params: TParams): Promise<TReturn>;
} & TFactoryMixin;

// factory is always transient in order to prevent memory leaks if factory definition is created dynamically - each dynamically created factory would create new entry for singleton in instances store
export type AsyncFactoryBuildFn = {
  <TInstance, TExternalParams extends any[]>(
    definition: AsyncFactoryDefinition<TInstance, LifeTime.request, TExternalParams>,
  ): InstanceDefinition<IAsyncFactory<TInstance, TExternalParams>, LifeTime.transient, []>;

  <TInstance, TExternalParams extends any[], TFactoryMixin extends object, TLifeTime extends LifeTime>(
    definition: AsyncFactoryDefinition<TInstance, LifeTime.request, TExternalParams>,
    factoryMixinDef: InstanceDefinition<TFactoryMixin, TLifeTime, []>,
  ): InstanceDefinition<IAsyncFactory<TInstance, TExternalParams, TFactoryMixin>, LifeTime.transient, []>;
};

export const asyncFactory: AsyncFactoryBuildFn = (
  definition: AnyInstanceDefinition<any, any, any>,
  factoryMixingDef?,
) => {
  return new InstanceDefinition({
    strategy: LifeTime.transient as const,
    externals: [],
    create: (context: ContainerContext): IAsyncFactory<any, any> => {
      const base = factoryMixingDef ? context.buildWithStrategy(factoryMixingDef) : {};

      return {
        ...base,
        build(...params): any {
          const reqContext = context.checkoutRequestScope(); // factory always uses new request context for building definitions
          return reqContext.getAsync(definition.bind(...params));
        },
      };
    },
  });
};
