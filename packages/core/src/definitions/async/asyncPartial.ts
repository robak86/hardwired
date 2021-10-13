import { PartialAnyInstancesDefinitionsArgs, PartiallyAppliedAsyncDefinition } from '../../utils/PartiallyApplied';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { v4 } from 'uuid';
import { PickExternals } from '../../utils/PickExternals';

export type AsyncPartiallyAppliedFnBuild = {
  <TValue, TArgs extends any[], TProvidedArgs extends PartialAnyInstancesDefinitionsArgs<TArgs>>(
    factory: (...args: TArgs) => Promise<TValue>,
    ...args: TProvidedArgs
  ): AsyncInstanceDefinition<
    PartiallyAppliedAsyncDefinition<TArgs, TProvidedArgs, TValue>,
    PickExternals<TProvidedArgs>
  >;
};

export const asyncPartial = (strategy: symbol): AsyncPartiallyAppliedFnBuild => {
  return (factory, ...args) => {
    return {
      id: v4(),
      strategy,
      isAsync: true,
      externalsIds: args.flatMap(def => def.externalsIds), // TODO: externalIds shouldn't have duplicates
      create: async context => {
        if (factory.length === 0) {
          return factory;
        } else {
          const dependenciesInstance = await Promise.all(args.map(context.buildWithStrategy));
          return (factory as any).bind(null, ...dependenciesInstance);
        }
      },
    } as any;
  };
};
