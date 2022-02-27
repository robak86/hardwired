import { PartialFnDependencies, PartiallyAppliedFn } from '../../utils/PartiallyApplied';
import { InstanceDefinition } from '../abstract/base/InstanceDefinition';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { uncurry, UnCurry } from '../../utils/UnCurry';
import { LifeTime } from '../abstract/LifeTime';

export type PartiallyAppliedFnBuild<TLifeTime extends LifeTime> = {
  <Fn extends (...args: any[]) => any, TArgs extends PartialFnDependencies<Parameters<UnCurry<Fn>>, TLifeTime>>(
    factory: Fn,
    ...dependencies: TArgs
  ): InstanceDefinition<
    PartiallyAppliedFn<Parameters<UnCurry<Fn>>, TArgs, ReturnType<UnCurry<Fn>>>,
    TLifeTime,
    PickExternals<TArgs> extends any[] ? PickExternals<TArgs> : []
  >;
};

export const partial = <TLifeTime extends LifeTime>(strategy: TLifeTime): PartiallyAppliedFnBuild<TLifeTime> => {
  return (fn, ...dependencies) => {
    const uncurried: any = uncurry(fn);

    return new InstanceDefinition({
      strategy,
      externals: pickExternals(dependencies),
      create: context => uncurried.bind(null, ...dependencies.map(context.buildWithStrategy)),
    });
  };
};
