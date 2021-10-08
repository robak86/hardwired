import { PartialInstancesDefinitionsArgs, PartiallyAppliedDefinition } from '../../utils/PartiallyApplied';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';

export type PartiallyAppliedFnBuild = {
  <TValue, TArgs extends any[], TProvidedArgs extends PartialInstancesDefinitionsArgs<TArgs>>(
    factory: (...args: TArgs) => TValue,
    ...args: TProvidedArgs
  ): InstanceDefinition<PartiallyAppliedDefinition<TArgs, TProvidedArgs, TValue>>;
};

export const partial = (strategy: symbol): PartiallyAppliedFnBuild => {
  return (factory, ...args) => ({
    id: v4(),
    strategy,
    isAsync: false,
    create: build => {
      if (factory.length === 0) {
        return factory;
      } else {
        return (factory as any).bind(null, ...args.map(build));
      }
    },

    meta: undefined as any,
  });
};
