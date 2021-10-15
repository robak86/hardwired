import { PartialInstancesDefinitionsArgs, PartiallyAppliedDefinition } from '../../utils/PartiallyApplied';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { uncurry, UnCurry } from '../../utils/UnCurry';

export type PartiallyAppliedFnBuild = {
  <Fn extends (...args: any[]) => any, TProvidedArgs extends PartialInstancesDefinitionsArgs<Parameters<UnCurry<Fn>>>>(
    factory: Fn,
    ...dependencies: TProvidedArgs
  ): InstanceDefinition<
    PartiallyAppliedDefinition<Parameters<UnCurry<Fn>>, TProvidedArgs, ReturnType<UnCurry<Fn>>>,
    PickExternals<TProvidedArgs>
  >;
};

export const partial = (strategy: symbol): PartiallyAppliedFnBuild => {
  return (fn, ...dependencies) => {
    const uncurried: any = uncurry(fn);

    return {
      id: v4(),
      strategy,
      isAsync: false,
      externals: pickExternals(dependencies),
      create: context => {
        return uncurried.bind(null, ...dependencies.map(context.buildWithStrategy));
        //
        // if (fn.length === 0) {
        //   return fn;
        // } else {
        //   return (fn as any).bind(null, ...dependencies.map(context.buildWithStrategy));
        // }
      },

      meta: undefined as any,
    };
  };
};
