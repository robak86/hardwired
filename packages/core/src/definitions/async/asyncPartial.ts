import { AsyncPartialFnDependencies, PartiallyAppliedAsyncFn } from '../../utils/PartiallyApplied';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { uncurryAsync, UnCurryAsync } from '../../utils/UnCurryAsync';
import { LifeTime } from '../abstract/LifeTime';
import { AsyncInstanceDefinition } from '../abstract/base/AsyncInstanceDefinition';
import { Resolution } from '../abstract/Resolution';

export type AsyncPartiallyAppliedFnBuild<TLifeTime extends LifeTime> = {
  <
    Fn extends (...args: any[]) => Promise<any> | any,
    TArgs extends AsyncPartialFnDependencies<Parameters<UnCurryAsync<Fn>>, TLifeTime>,
  >(
    factory: Fn,
    ...dependencies: TArgs
  ): AsyncInstanceDefinition<
    PartiallyAppliedAsyncFn<Parameters<UnCurryAsync<Fn>>, TArgs, ReturnType<UnCurryAsync<Fn>>>,
    TLifeTime,
    PickExternals<TArgs> extends any[] ? PickExternals<TArgs> : never
  >;
};

export const asyncPartial = <TLifeTime extends LifeTime>(
  strategy: TLifeTime,
): AsyncPartiallyAppliedFnBuild<TLifeTime> => {
  return (fn, ...args) => {
    const uncurried: any = uncurryAsync(fn);

    return new AsyncInstanceDefinition({
      id: v4(),
      strategy,
      externals: pickExternals(args),
      create: async context => {
        const dependenciesInstance = await Promise.all(args.map(context.buildWithStrategy));
        return uncurried.bind(null, ...dependenciesInstance);
      },
    });
  };
};
