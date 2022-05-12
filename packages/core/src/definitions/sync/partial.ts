import { PartialFnDependencies, PartiallyAppliedFn } from '../../utils/PartiallyApplied';
import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { assertNoExternals, pickExternals, PickExternals } from '../../utils/PickExternals';
import { uncurry, UnCurry } from '../../utils/UnCurry';
import { LifeTime } from '../abstract/LifeTime';
import { Resolution } from '../abstract/Resolution';
import { v4 } from 'uuid';

export type PartiallyAppliedFnBuild<TLifeTime extends LifeTime> = {
  <Fn extends (...args: any[]) => any, TArgs extends PartialFnDependencies<Parameters<UnCurry<Fn>>, TLifeTime>>(
    factory: Fn,
    ...dependencies: TArgs
  ): InstanceDefinition<
    PartiallyAppliedFn<Parameters<UnCurry<Fn>>, TArgs, ReturnType<UnCurry<Fn>>>,
    TLifeTime,
    PickExternals<TArgs>
  >;
};

export const partial = <TLifeTime extends LifeTime>(strategy: TLifeTime): PartiallyAppliedFnBuild<TLifeTime> => {
  return (fn: any, ...dependencies: any[]) => {
    const uncurried: any = uncurry(fn);
    const externals = pickExternals(dependencies);
    assertNoExternals(strategy, externals);

    return {
      id: `${fn.name}:${v4()}`,
      resolution: Resolution.sync,
      strategy,
      externals,
      create: context => uncurried.bind(null, ...dependencies.map(context.buildWithStrategy)),
    };
  };
};
