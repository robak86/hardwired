import { InstanceDefinition, LifeTime, Resolution } from 'hardwired';
import { IObservableValue, isBoxedObservable, isObservable, runInAction } from 'mobx';
import { v4 } from 'uuid';

export type ComputedBuildFn = {
  <TDeps extends any[], TFunctionArgs extends any[], TParams>(
    factory: (...args: [TParams, ...TFunctionArgs]) => void,
    ...args: [
      ...{
        [K in keyof TFunctionArgs]: InstanceDefinition<
          TFunctionArgs[K] | IObservableValue<TFunctionArgs[K]>,
          LifeTime.singleton
        >;
      }
    ]
  ): InstanceDefinition<(params: TParams) => void, LifeTime.singleton>;

  <TDeps extends any[], TFunctionArgs extends any[]>(
    factory: (...args: [...TFunctionArgs]) => void,
    ...args: [
      ...{
        [K in keyof TFunctionArgs]: InstanceDefinition<
          TFunctionArgs[K] | IObservableValue<TFunctionArgs[K]>,
          LifeTime.singleton
        >;
      }
    ]
  ): InstanceDefinition<() => void, LifeTime.singleton>;
};

export const action: ComputedBuildFn = (factory, ...dependencies): InstanceDefinition<any, LifeTime.singleton> => {
  return {
    id: `action:${v4()}`,
    strategy: LifeTime.singleton,
    resolution: Resolution.sync,
    externals: dependencies.flatMap(def => def.externals),
    create: context => {
      // TODO: optimize - at this line we can check which dependencies are observable and call .get selectively in computed body

      return (...actionArgs) => {
        runInAction(() => {
          (factory as any)(
            ...actionArgs,
            ...dependencies.map(context.buildWithStrategy).map(d => {
              return isBoxedObservable(d) ? d.get() : d;
            }),
          );
        });
      };
    },
  };
};
