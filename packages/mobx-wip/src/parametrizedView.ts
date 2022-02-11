import { InstanceDefinition, LifeTime, Resolution } from 'hardwired';
import { IObservableValue, isObservable } from 'mobx';
import { v4 } from 'uuid';
import 'source-map-support/register';
import { createTransformer } from './utils/createTransformer';

export type ParametrizedViewBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[], TParams extends Array<string | number>>(
    factory: (...params: TParams) => (...args: [...TFunctionArgs]) => TValue,
    ...args: {
      [K in keyof TFunctionArgs]: InstanceDefinition<
        IObservableValue<TFunctionArgs[K]> | TFunctionArgs[K],
        LifeTime.singleton
      >;
    }
  ): InstanceDefinition<(...params: TParams) => TValue, LifeTime.singleton>;
};

export const parametrizedView: ParametrizedViewBuildFn = (
  factory,
  ...dependencies
): InstanceDefinition<any, LifeTime.singleton> => {
  return new InstanceDefinition({
    id: `${factory.name}:${v4()}`,
    strategy: LifeTime.singleton,
    externals: dependencies.flatMap(def => def.externals),
    create: context => {
      return createTransformer((...params: any) => {
        const deps = dependencies.map(d => {
          const instance = context.buildWithStrategy(d);
          return isObservable(instance) ? instance.get() : (instance as any);
        }) as any;

        return factory(...params)(...deps);
      });
    },
  });
};
