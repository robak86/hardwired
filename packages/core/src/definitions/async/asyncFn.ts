import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { AsyncSingletonStrategy } from '../../strategies/async/AsyncSingletonStrategy';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';

export type AsyncFunctionDefinitionBuildFn = {
  <
    TValue,
    TFunctionArgs extends any[],
    TDeps extends { [K in keyof TFunctionArgs]: AnyInstanceDefinition<TFunctionArgs[K], any> },
  >(
    factory: (...args: TFunctionArgs) => Promise<TValue>,
    ...args: TDeps
  ): AsyncInstanceDefinition<TValue, PickExternals<TDeps>>;
};

export const asyncFn = (strategy: symbol): AsyncFunctionDefinitionBuildFn => {
  return (factory, ...dependencies) => {
    return {
      id: `${factory.name}:${v4()}`,
      strategy,
      isAsync: true,
      externals: pickExternals(dependencies),
      create: async context => {
        const dependenciesInstance = await Promise.all(dependencies.map(context.buildWithStrategy));
        return factory(...(dependenciesInstance as any));
      },

      meta: undefined,
    };
  };
};
