import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';
import { ContainerContext } from '../../context/ContainerContext';
import { ExternalsRecord } from '../abstract/base/BaseDefinition';
import { IsNever } from '../../utils/TypesHelpers';
import { Resolution } from '../abstract/Resolution';
import { v4 } from 'uuid';

// prettier-ignore
export type FactoryDefinition<TValue, TLifeTime extends LifeTime, TExternalParams extends ExternalsRecord> =
    | InstanceDefinition<TValue, LifeTime.singleton, never>
    | InstanceDefinition<TValue, LifeTime.transient, TExternalParams>
    | InstanceDefinition<TValue, LifeTime.request, TExternalParams>
    | InstanceDefinition<TValue, LifeTime.scoped, TExternalParams>

export type IFactory<TReturn, TParams extends ExternalsRecord, TFactoryMixin = unknown> = {
  build(params: IsNever<TParams> extends true ? void : TParams): TReturn;
} & TFactoryMixin;

// factory is always transient in order to prevent memory leaks if factory definition is created dynamically - each dynamically created factory would create new entry for singleton in instances store
export type FactoryBuildFn = {
  <TInstance, TExternalParams extends ExternalsRecord>(
    definition: FactoryDefinition<TInstance, LifeTime.request, TExternalParams>,
  ): InstanceDefinition<IFactory<TInstance, TExternalParams>, LifeTime.transient, never>;

  <TInstance, TExternalParams extends ExternalsRecord, TFactoryMixin extends object, TLifeTime extends LifeTime>(
    definition: FactoryDefinition<TInstance, LifeTime.request, TExternalParams>,
    factoryMixinDef: InstanceDefinition<TFactoryMixin, TLifeTime, never>,
  ): InstanceDefinition<IFactory<TInstance, TExternalParams, TFactoryMixin>, LifeTime.transient, never>;
};

export const factory: FactoryBuildFn = (definition: any, factoryMixingDef?: any): any => {
  return {
    id: v4(),
    resolution: Resolution.sync,
    strategy: LifeTime.transient as const,
    externals: [],
    create: (context: ContainerContext): IFactory<any, any> => {
      const base = factoryMixingDef ? context.buildWithStrategy(factoryMixingDef) : {};

      return {
        ...base,
        build(...params): any {
          const reqContext = context.checkoutRequestScope(); // factory always uses new request context for building definitions
          return reqContext.get(definition, ...params);
        },
      };
    },
  };
};
