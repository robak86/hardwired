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

export const selector: ComputedBuildFn = (factory, ...dependencies): InstanceDefinition<any> => {
  return {
    id: `${factory.name}:${v4()}`,
    strategy: SingletonStrategy.type,
    create: (dependencies: any[]) => {
      // TODO: at this line we can check which dependencies are observable and call .get selectively in computed body

      return computed(() => {
        const deps = dependencies.map(d => {
          return isObservable(d) ? d.get() : d;
        }) as any;
        return factory(...deps);
      });
    },
    dependencies,
    meta: undefined,
  };
};
