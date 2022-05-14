import { AsyncPartialFnDependencies, PartiallyAppliedAsyncFn } from '../../utils/PartiallyApplied';
import { PickExternals } from '../../utils/PickExternals';
import { uncurryAsync, UnCurryAsync } from '../../utils/UnCurryAsync';
import { LifeTime } from '../abstract/LifeTime';
import { asyncDefinition, AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition';

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
