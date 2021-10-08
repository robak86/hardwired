import { InstanceDefinition, SingletonStrategy } from 'hardwired';
import { IObservableValue, isObservable, runInAction } from 'mobx';
import { v4 } from 'uuid';

export type ComputedBuildFn = {
  <TDeps extends any[], TFunctionArgs extends any[], TParams>(
    factory: (...args: [TParams, ...TFunctionArgs]) => void,
    ...args: [
      ...{ [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K] | IObservableValue<TFunctionArgs[K]>> }
    ]
  ): InstanceDefinition<(params: TParams) => void>;

  <TDeps extends any[], TFunctionArgs extends any[]>(
    factory: (...args: [...TFunctionArgs]) => void,
    ...args: [
      ...{ [K in keyof TFunctionArgs]: InstanceDefinition<TFunctionArgs[K] | IObservableValue<TFunctionArgs[K]>> }
    ]
  ): InstanceDefinition<() => void>;
};

export const action: ComputedBuildFn = (factory, ...dependencies): InstanceDefinition<any> => {
  return {
    id: `action:${v4()}`,
    strategy: SingletonStrategy.type,
    isAsync: false,
    create: build => {
      // TODO: at this line we can check which dependencies are observable and call .get selectively in computed body

      return (...actionArgs) => {
        runInAction(() => {
          (factory as any)(
            ...actionArgs,
            ...dependencies.map(build).map(d => {
              return isObservable(d) ? d.get() : d;
            }),
          );
        });
      };
    },
  };
};
