import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';
import { ContainerContext } from '../../context/ContainerContext';

import { v4 } from 'uuid';
import { Resolution } from '../abstract/Resolution';
import { NeverToVoid } from "../../utils/PickExternals";

// prettier-ignore
export type AsyncFactoryDefinition<TValue, TLifeTime extends LifeTime, TExternalParams> =
    | AnyInstanceDefinition<TValue, LifeTime.singleton, never>
    | AnyInstanceDefinition<TValue, LifeTime.transient, TExternalParams>
    | AnyInstanceDefinition<TValue, LifeTime.request, TExternalParams>
    | AnyInstanceDefinition<TValue, LifeTime.scoped, TExternalParams>

export type IAsyncFactory<TReturn, TParams extends Record<string, any>, TFactoryMixin = unknown> = {
  build(params: NeverToVoid<TParams>): Promise<TReturn>;
} & TFactoryMixin;

// factory is always transient in order to prevent memory leaks if factory definition is created dynamically - each dynamically created factory would create new entry for singleton in instances store
export type AsyncFactoryBuildFn = {
  <TInstance, TExternalParams>(
    definition: AsyncFactoryDefinition<TInstance, LifeTime.request, TExternalParams>,
  ): InstanceDefinition<IAsyncFactory<TInstance, TExternalParams>, LifeTime.transient, never>;

  <TInstance, TExternalParams, TFactoryMixin extends object, TLifeTime extends LifeTime>(
    definition: AsyncFactoryDefinition<TInstance, LifeTime.request, TExternalParams>,
    factoryMixinDef: InstanceDefinition<TFactoryMixin, TLifeTime, never>,
  ): InstanceDefinition<IAsyncFactory<TInstance, TExternalParams, TFactoryMixin>, LifeTime.transient, never>;
};

export const asyncFactory: AsyncFactoryBuildFn = (
  definition: AnyInstanceDefinition<any, any, any>,
  factoryMixingDef?: any,
): any => {
  return {
    id: v4(),
    resolution: Resolution.sync,
    strategy: LifeTime.transient as const,
    externals: [],
    create: (context: ContainerContext): IAsyncFactory<any, any> => {
      const base = factoryMixingDef ? context.buildWithStrategy(factoryMixingDef) : {};

      return {
        ...base,
        build(...params): any {
          const reqContext = context.checkoutRequestScope(); // factory always uses new request context for building definitions
          return reqContext.getAsync(definition, ...params);
        },
      };
    },
  };
};
