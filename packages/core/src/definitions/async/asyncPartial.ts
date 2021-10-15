import {
  PartialAnyInstancesDefinitionsArgs,
  PartialInstancesDefinitionsArgs,
  PartiallyAppliedAsyncDefinition,
  PartiallyAppliedDefinition,
} from '../../utils/PartiallyApplied';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { uncurry, UnCurry } from '../../utils/UnCurry';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { uncurryAsync, UnCurryAsync } from '../../utils/UnCurryAsync';

// export type AsyncPartiallyAppliedFnBuild = {
//   <TValue, TArgs extends any[], TProvidedArgs extends PartialAnyInstancesDefinitionsArgs<TArgs>>(
//     factory: (...args: TArgs) => Promise<TValue>,
//     ...args: TProvidedArgs
//   ): AsyncInstanceDefinition<
//     PartiallyAppliedAsyncDefinition<TArgs, TProvidedArgs, TValue>,
//     PickExternals<TProvidedArgs>
//   >;
// };

export type AsyncPartiallyAppliedFnBuild = {
  <
    Fn extends (...args: any[]) => Promise<any>,
    TProvidedArgs extends PartialAnyInstancesDefinitionsArgs<Parameters<UnCurryAsync<Fn>>>,
  >(
    factory: Fn,
    ...dependencies: TProvidedArgs
  ): InstanceDefinition<
    PartiallyAppliedAsyncDefinition<Parameters<UnCurryAsync<Fn>>, TProvidedArgs, ReturnType<UnCurryAsync<Fn>>>,
    PickExternals<TProvidedArgs>
  >;
};

export const asyncPartial = (strategy: symbol): AsyncPartiallyAppliedFnBuild => {
  return (fn, ...args) => {
    const uncurried: any = uncurryAsync(fn);

    return {
      id: v4(),
      strategy,
      isAsync: true,
      externals: pickExternals(args),
      create: async context => {
        const dependenciesInstance = await Promise.all(args.map(context.buildWithStrategy));
        return uncurried.bind(null, ...dependenciesInstance);
      },
    } as any;
  };
};
