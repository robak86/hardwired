import { PartialAnyInstancesDefinitionsArgs, PartiallyAppliedAsyncDefinition } from '../../utils/PartiallyApplied';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { uncurryAsync, UnCurryAsync } from '../../utils/UnCurryAsync';
import { LifeTime, Resolution } from '../abstract/LifeTime';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';

export type AsyncPartiallyAppliedFnBuild<TLifeTime extends LifeTime> = {
  <
    Fn extends (...args: any[]) => Promise<any>,
    TProvidedArgs extends PartialAnyInstancesDefinitionsArgs<Parameters<UnCurryAsync<Fn>>>,
  >(
    factory: Fn,
    ...dependencies: TProvidedArgs
  ): AsyncInstanceDefinition<
    PartiallyAppliedAsyncDefinition<Parameters<UnCurryAsync<Fn>>, TProvidedArgs, ReturnType<UnCurryAsync<Fn>>>,
    TLifeTime,
    PickExternals<TProvidedArgs>
  >;
};

export const asyncPartial = <TLifeTime extends LifeTime>(
  strategy: TLifeTime,
): AsyncPartiallyAppliedFnBuild<TLifeTime> => {
  return (fn, ...args) => {
    const uncurried: any = uncurryAsync(fn);

    return {
      id: v4(),
      strategy,
      resolution: Resolution.async,
      externals: pickExternals(args),
      create: async context => {
        const dependenciesInstance = await Promise.all(args.map(context.buildWithStrategy));
        return uncurried.bind(null, ...dependenciesInstance);
      },
    };
  };
};
