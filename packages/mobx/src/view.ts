import { InstanceDefinition, SingletonStrategy } from 'hardwired';
import { computed, IObservableValue, isObservable } from 'mobx';
import { v4 } from 'uuid';
import 'source-map-support/register';

export type ComputedBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[]>(
    selectFn: (...args: TFunctionArgs) => TValue,
    ...args: [
      ...{ [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K] | IObservableValue<TFunctionArgs[K]>> }
    ]
  ): InstanceDefinition<IObservableValue<TValue>>;
};

export const view: ComputedBuildFn = (factory, ...dependencies): InstanceDefinition<any> => {
  return {
    id: `${factory.name}:${v4()}`,
    strategy: SingletonStrategy.type,
    isAsync: false,
    externalsIds: dependencies.flatMap(def => def.externalsIds),
    create: (build) => {
      // TODO: at this line we can check which dependencies are observable and call .get selectively in computed body

      return computed(() => {
        const deps = dependencies.map(d => {
          const instance = build(d)
          return isObservable(instance) ? instance.get() : instance;
        }) as any;
        return factory(...deps);
      });
    }
  };
};
