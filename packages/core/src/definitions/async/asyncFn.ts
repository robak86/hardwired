import { AnyInstanceDefinition } from '../abstract/AnyInstanceDefinition';
import { AsyncSingletonStrategy } from '../../strategies/async/AsyncSingletonStrategy';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { v4 } from 'uuid';

export type AsyncFunctionDefinitionBuildFn = {
  <TValue, TDeps extends any[], TFunctionArgs extends any[]>(
    factory: (...args: TFunctionArgs) => Promise<TValue>,
    ...args: { [K in keyof TFunctionArgs]: AnyInstanceDefinition<TFunctionArgs[K]> }
  ): AsyncInstanceDefinition<TValue, any>;
};

export const asyncFn = (strategy: symbol): AsyncFunctionDefinitionBuildFn => {
  return (factory, ...args) => {
    return {
      id: `${factory.name}:${v4()}`,
      strategy,
      isAsync: true,
      create: async context => {
        const dependenciesInstance = await Promise.all(args.map(context.buildWithStrategy));
        return factory(...(dependenciesInstance as any));
      },

      meta: undefined,
    };
  };
};

