import { PartialInstancesDefinitionsArgs, PartiallyAppliedDefinition } from '../../utils/PartiallyApplied';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { PickExternals } from "../../utils/PickExternals";

export type PartiallyAppliedFnBuild = {
  <TValue, TArgs extends any[], TProvidedArgs extends PartialInstancesDefinitionsArgs<TArgs>>(
    factory: (...args: TArgs) => TValue,
    ...dependencies: TProvidedArgs
  ): InstanceDefinition<PartiallyAppliedDefinition<TArgs, TProvidedArgs, TValue>, PickExternals<TProvidedArgs>>;
};

export const partial = (strategy: symbol): PartiallyAppliedFnBuild => {
  return (factory, ...dependencies) => ({
    id: v4(),
    strategy,
    isAsync: false,
    externalsIds: dependencies.flatMap(def => def.externalsIds), // TODO: externalIds shouldn't have duplicates
    create: context => {
      if (factory.length === 0) {
        return factory;
      } else {
        return (factory as any).bind(null, ...dependencies.map(context.buildWithStrategy));
      }
    },

    meta: undefined as any,
  });
};
