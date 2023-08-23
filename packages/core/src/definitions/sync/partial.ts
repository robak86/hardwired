import { PartialFnDependencies, PartiallyAppliedFn } from '../../utils/PartiallyApplied.js';
import { InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { uncurry, UnCurry } from '../../utils/UnCurry.js';
import { LifeTime } from '../abstract/LifeTime.js';

export const partial = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <
    TFunction extends (...args: any[]) => any,
    TFunctionParams extends PartialFnDependencies<Parameters<UnCurry<TFunction>>, TLifeTime>,
  >(
    fn: TFunction,
    ...dependencies: TFunctionParams
  ): InstanceDefinition<
    PartiallyAppliedFn<Parameters<UnCurry<TFunction>>, TFunctionParams, ReturnType<UnCurry<TFunction>>>,
    TLifeTime
  > => {
    const uncurried: any = uncurry(fn);

    return InstanceDefinition.create(strategy, context =>
      uncurried.bind(null, ...dependencies.map(context.buildWithStrategy)),
    );
  };
};
