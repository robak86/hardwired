import { InstanceDefinition, InstanceDefinitionContext } from '../abstract/InstanceDefinition';
import { LifeTime } from '../abstract/LifeTime';
import { FactoryDefinition } from '../abstract/FactoryDefinition';

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
    create: (context: InstanceDefinitionContext): IFactory<any, any> => {
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
