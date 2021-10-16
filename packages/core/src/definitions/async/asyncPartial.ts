import { PartialAnyInstancesDefinitionsArgs, PartiallyAppliedAsyncDefinition } from '../../utils/PartiallyApplied';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { uncurryAsync, UnCurryAsync } from '../../utils/UnCurryAsync';
import { LifeTime} from '../abstract/LifeTime';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { Resolution } from "../abstract/Resolution";

export type AsyncPartiallyAppliedFnBuild<TLifeTime extends LifeTime> = {
  <
    Fn extends (...args: any[]) => Promise<any>,
    TArgs extends PartialAnyInstancesDefinitionsArgs<Parameters<UnCurryAsync<Fn>>, TLifeTime>,
  >(
    factory: Fn,
    ...dependencies: TArgs
  ): AsyncInstanceDefinition<
    PartiallyAppliedAsyncDefinition<Parameters<UnCurryAsync<Fn>>, TArgs, ReturnType<UnCurryAsync<Fn>>>,
    TLifeTime,
    PickExternals<TArgs>
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
