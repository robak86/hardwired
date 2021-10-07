import { InstanceDefinition, SingletonStrategy } from 'hardwired';
import { IObservableValue, isObservable } from 'mobx';
import { v4 } from 'uuid';
import 'source-map-support/register';
import { createTransformer } from './utils/createTransformer';

export type ParametrizedViewBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[], TParams extends string | number>(
    factory: (...args: [...TFunctionArgs, TParams]) => TValue,
    ...args: { [K in keyof TFunctionArgs]: InstanceDefinition<IObservableValue<TFunctionArgs[K]> | TFunctionArgs[K]> }
  ): InstanceDefinition<(params: TParams) => TValue>;
};

export const parametrizedView: ParametrizedViewBuildFn = (factory, ...dependencies): InstanceDefinition<any> => {
  return {
    id: `${factory.name}:${v4()}`,
    strategy: SingletonStrategy.type,
    create: build => {
      return createTransformer((params: any) => {
        const deps = dependencies.map(d => {
          const instance = build(d);
          return isObservable(instance) ? instance.get() : (instance as any);
        }) as any;
        deps.push(params);
        return factory(...deps);
      });
    },
    meta: undefined,
  };
};
