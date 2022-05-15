import { AsyncPartialFnDependencies, PartiallyAppliedAsyncFn } from '../../utils/PartiallyApplied.js';
import { PickExternals } from '../../utils/PickExternals.js';
import { uncurryAsync, UnCurryAsync } from '../../utils/UnCurryAsync.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { asyncDefinition, AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition.js';

export const asyncPartial = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <
    TFunction extends (...params: any[]) => Promise<any>,
    TFunctionParams extends AsyncPartialFnDependencies<Parameters<UnCurryAsync<TFunction>>, TLifeTime>,
  >(
    fn: TFunction,
    ...dependencies: TFunctionParams
  ): AsyncInstanceDefinition<
    PartiallyAppliedAsyncFn<Parameters<UnCurryAsync<TFunction>>, TFunctionParams, ReturnType<UnCurryAsync<TFunction>>>,
    TLifeTime,
    PickExternals<TFunctionParams>
  > => {
    const uncurried: any = uncurryAsync(fn);

    return asyncDefinition({
      dependencies,
      strategy,
      create: async context => {
        const dependenciesInstance = await Promise.all(dependencies.map(context.buildWithStrategy));
        return uncurried.bind(null, ...dependenciesInstance);
      },
    });
  };
};
