import { instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { ExternalsValuesRecord } from '../abstract/base/BaseDefinition.js';
import { NeverToVoid } from '../../utils/PickExternals.js';

// prettier-ignore
export type FactoryDefinition<TValue, TLifeTime extends LifeTime, TExternalParams extends ExternalsValuesRecord> =
    | InstanceDefinition<TValue, LifeTime.singleton, never>
    | InstanceDefinition<TValue, LifeTime.transient, TExternalParams>
    | InstanceDefinition<TValue, LifeTime.request, TExternalParams>
    | InstanceDefinition<TValue, LifeTime.scoped, TExternalParams>

export type IFactory<TReturn, TParams extends ExternalsValuesRecord, TFactoryMixin = unknown> = {
  build(params: NeverToVoid<TParams>): TReturn;
} & TFactoryMixin;

// factory is always transient in order to prevent memory leaks if factory definition is created dynamically - each dynamically created factory would create new entry for singleton in instances store
export type FactoryBuildFn = {
  <TInstance, TExternalParams extends ExternalsValuesRecord>(
    definition: FactoryDefinition<TInstance, LifeTime.request, TExternalParams>,
  ): InstanceDefinition<IFactory<TInstance, TExternalParams>, LifeTime.transient, never>;

  <TInstance, TExternalParams extends ExternalsValuesRecord, TFactoryMixin extends object, TLifeTime extends LifeTime>(
    definition: FactoryDefinition<TInstance, LifeTime.request, TExternalParams>,
    factoryMixinDef: InstanceDefinition<TFactoryMixin, TLifeTime, never>,
  ): InstanceDefinition<IFactory<TInstance, TExternalParams, TFactoryMixin>, LifeTime.transient, never>;
};

export const factory: FactoryBuildFn = (definition: any, factoryMixingDef?: any): any => {
  return instanceDefinition({
    strategy: LifeTime.transient,
    dependencies: [],
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
  });
};
