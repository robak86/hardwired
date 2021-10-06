import { InstanceDefinition, SingletonStrategy } from 'hardwired';
import { IObservableValue, runInAction } from 'mobx';
import { v4 } from 'uuid';

export type ComputedBuildFn = {
  <TDeps extends any[], TFunctionArgs extends any[]>(
    factory: (...args: TFunctionArgs) => void,
    ...args: [...{ [K in keyof TFunctionArgs]: InstanceDefinition<IObservableValue<TFunctionArgs[K]>> }]
  ): InstanceDefinition<() => void>;

  <TDeps extends any[], TFunctionArgs extends any[], TParams>(
    factory: (...args: [TParams, ...TFunctionArgs]) => void,
    ...args: [...{ [K in keyof TFunctionArgs]: InstanceDefinition<IObservableValue<TFunctionArgs[K]>> }]
  ): InstanceDefinition<(params: TParams) => void>;
};

export const action: ComputedBuildFn = (factory, ...args): InstanceDefinition<any> => {
  return {
    id: `action:${v4()}`,
    strategy: SingletonStrategy.type,
    create: dependencies => {
      return (...actionArgs) => {
        runInAction(() => {
          (factory as any)(...actionArgs, ...dependencies.map(d => d.get()));
        });
      };
    },
    dependencies: args,
    meta: undefined,
  };
};
