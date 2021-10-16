import { PartialInstancesDefinitionsArgs, PartiallyAppliedDefinition } from '../../utils/PartiallyApplied';
import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { v4 } from 'uuid';
import { pickExternals, PickExternals } from '../../utils/PickExternals';
import { uncurry, UnCurry } from '../../utils/UnCurry';
import { LifeTime} from '../abstract/LifeTime';
import { Resolution } from "../abstract/Resolution";

export type PartiallyAppliedFnBuild<TLifeTime extends LifeTime> = {
  <
    Fn extends (...args: any[]) => any,
    TArgs extends PartialInstancesDefinitionsArgs<Parameters<UnCurry<Fn>>, TLifeTime>,
  >(
    factory: Fn,
    ...dependencies: TArgs
  ): InstanceDefinition<
    PartiallyAppliedDefinition<Parameters<UnCurry<Fn>>, TArgs, ReturnType<UnCurry<Fn>>>,
    TLifeTime,
    PickExternals<TArgs>
  >;
};

export const partial = <TLifeTime extends LifeTime>(strategy: TLifeTime): PartiallyAppliedFnBuild<TLifeTime> => {
  return (fn, ...dependencies) => {
    const uncurried: any = uncurry(fn);

    return {
      id: v4(),
      strategy,
      resolution: Resolution.sync,
      externals: pickExternals(dependencies),
      create: context => uncurried.bind(null, ...dependencies.map(context.buildWithStrategy)),
    };
  };
};
