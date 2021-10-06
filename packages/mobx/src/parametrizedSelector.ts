import { InstanceDefinition, SingletonStrategy } from 'hardwired';
import { IObservableValue, isObservable } from 'mobx';
import { v4 } from 'uuid';
import 'source-map-support/register';
import { createTransformer } from './utils/createTransformer';

export type ComputedBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[], TParams extends string | number>(
    factory: (...args: [...TFunctionArgs, TParams]) => TValue,
    ...args: { [K in keyof TFunctionArgs]: InstanceDefinition<IObservableValue<TFunctionArgs[K]> | TFunctionArgs[K]> }
  ): InstanceDefinition<(params: TParams) => TValue>;
};

export const parametrizedSelector: ComputedBuildFn = (factory, ...dependencies): InstanceDefinition<any> => {
  return {
    id: `${factory.name}:${v4()}`,
    strategy: SingletonStrategy.type,
    create: (dependencies: any[]) => {
      return createTransformer((params: any) => {
        const deps = dependencies.map(d => (isObservable(d) ? d.get() : (d as any))) as any;
        deps.push(params);
        return factory(...deps);
      });
    },
    dependencies,
    meta: undefined,
  };
};
