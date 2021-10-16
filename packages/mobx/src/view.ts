import { InstanceDefinition, LifeTime, Resolution } from 'hardwired';
import { computed, IObservableValue, isObservable } from 'mobx';
import { v4 } from 'uuid';
import 'source-map-support/register';

export type ComputedBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[]>(
    selectFn: (...args: TFunctionArgs) => TValue,
    ...args: [
      ...{
        [K in keyof TFunctionArgs]: InstanceDefinition<
          TFunctionArgs[K] | IObservableValue<TFunctionArgs[K]>,
          LifeTime.singleton
        >;
      }
    ]
  ): InstanceDefinition<IObservableValue<TValue>, LifeTime.singleton>;
};

export const view: ComputedBuildFn = (factory, ...dependencies): InstanceDefinition<any, LifeTime.singleton> => {
  return {
    id: `${factory.name}:${v4()}`,
    strategy: LifeTime.singleton,
    resolution: Resolution.sync,
    externals: dependencies.flatMap(def => def.externals),
    create: context => {
      // TODO: optimize -  at this line we can check which dependencies are observable and call .get selectively in computed body

      return computed(() => {
        const deps = dependencies.map(d => {
          const instance = context.buildWithStrategy(d);
          return isObservable(instance) ? instance.get() : instance;
        }) as any;
        return factory(...deps);
      });
    },
  };
};
