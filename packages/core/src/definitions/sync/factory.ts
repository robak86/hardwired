import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';
import { ContainerContext } from '../../context/ContainerContext';

// prettier-ignore
export type FactoryDefinition<TValue, TLifeTime extends LifeTime, TExternalParams extends any[]> =
    | InstanceDefinition<TValue, LifeTime.singleton, []>
    | InstanceDefinition<TValue, LifeTime.transient, TExternalParams>
    | InstanceDefinition<TValue, LifeTime.request, TExternalParams>
    | InstanceDefinition<TValue, LifeTime.scoped, TExternalParams>

export type IFactory<TReturn, TParams extends any[], TFactoryMixin = unknown> = {
  build(...params: TParams): TReturn;
} & TFactoryMixin;

// factory is always transient in order to prevent memory leaks if factory definition is created dynamically - each dynamically created factory would create new entry for singleton in instances store
export type FactoryBuildFn = {
  <TInstance, TExternalParams extends any[]>(
    definition: FactoryDefinition<TInstance, LifeTime.request, TExternalParams>,
  ): InstanceDefinition<IFactory<TInstance, TExternalParams>, LifeTime.transient, []>;

  <TInstance, TExternalParams extends any[], TFactoryMixin extends object, TLifeTime extends LifeTime>(
    definition: FactoryDefinition<TInstance, LifeTime.request, TExternalParams>,
    factoryMixinDef: InstanceDefinition<TFactoryMixin, TLifeTime>,
  ): InstanceDefinition<IFactory<TInstance, TExternalParams, TFactoryMixin>, LifeTime.transient, []>;
};

export const factory: FactoryBuildFn = (definition, factoryMixingDef?) => {
  return new InstanceDefinition({
    strategy: LifeTime.transient as const,
    externals: [],
    create: (context: ContainerContext): IFactory<any, any> => {
      const base = factoryMixingDef ? context.buildWithStrategy(factoryMixingDef) : {};

      return {
        ...base,
        build(...params): any {
          const reqContext = context.checkoutRequestScope(); // factory always uses new request context for building definitions
          return reqContext.get(definition.bind(...params));
        },
      };
    },
  });
};
