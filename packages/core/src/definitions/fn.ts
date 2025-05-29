import type { AwaitedArray } from '../configuration/abstract/IRegisterAware.js';
import type { HasPromise } from '../container/IContainer.js';

import type { IDefinition } from './abstract/IDefinition.js';
import { LifeTime } from './abstract/LifeTime.js';
import { FnDefinition } from './impl/FnDefinition.js';
import type { ConstructorArgsTokens } from './cls.js';
import type { InstancesArray } from './abstract/InstanceDefinition.js';
import type { IDefinitionToken } from './tokens.js';

export type WrapFnResultAsync<TInstance, TDependenciesDefinitions extends IDefinitionToken<any, any>[]> =
  HasPromise<InstancesArray<TDependenciesDefinitions>> extends true ? Promise<TInstance> : TInstance;

export const fnDefinition = <TLifeTime extends LifeTime>(lifeTime: TLifeTime) => {
  return <TArgs extends any[], TInstance, TDepsTokens extends ConstructorArgsTokens<TArgs, TLifeTime>>(
    ...args: [...TDepsTokens, (...args: AwaitedArray<TArgs>) => TInstance]
  ): IDefinition<WrapFnResultAsync<TInstance, TDepsTokens>, TLifeTime> => {
    const fn = args.pop() as (...args: AwaitedArray<TArgs>) => TInstance;
    const dependencies = args as ConstructorArgsTokens<TArgs, TLifeTime>;

    return new FnDefinition(
      Symbol('fn'),
      lifeTime,
      fn as any, // TODO
      dependencies,
    ) as any;
  };
};

export const fn = {
  singleton: fnDefinition(LifeTime.singleton),
  scoped: fnDefinition(LifeTime.scoped),
  cascading: fnDefinition(LifeTime.cascading),
};
