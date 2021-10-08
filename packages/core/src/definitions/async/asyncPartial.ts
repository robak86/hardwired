import { PartialAnyInstancesDefinitionsArgs, PartiallyAppliedAsyncDefinition } from '../../utils/PartiallyApplied';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { v4 } from 'uuid';

export type AsyncPartiallyAppliedFnBuild = {
  <TValue, TArgs extends any[], TProvidedArgs extends PartialAnyInstancesDefinitionsArgs<TArgs>>(
    factory: (...args: TArgs) => Promise<TValue>,
    ...args: TProvidedArgs
  ): AsyncInstanceDefinition<PartiallyAppliedAsyncDefinition<TArgs, TProvidedArgs, TValue>, any>;
};

export const asyncPartial = (strategy: symbol): AsyncPartiallyAppliedFnBuild => {
  return (factory, ...args) => {
    return {
      id: v4(),
      strategy,
      isAsync: true,
      create: async build => {
        if (factory.length === 0) {
          return factory;
        } else {
          const dependenciesInstance = await Promise.all(args.map(build));
          return (factory as any).bind(null, ...dependenciesInstance);
        }
      },
      meta: undefined as any,
    } as any;
  };
};
