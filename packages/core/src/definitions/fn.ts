import type { HasPromise } from '../container/IContainer.js';
import type { AwaitedInstanceArray } from '../container/Container.js';

import type { IDefinition } from './abstract/IDefinition.js';
import { LifeTime } from './abstract/LifeTime.js';
import { FnDefinition } from './impl/FnDefinition.js';
import type { InstancesArray } from './abstract/InstanceDefinition.js';
import type { ValidDependenciesLifeTime } from './abstract/InstanceDefinitionDependency.js';
import type { IDefinitionToken } from './DefinitionToken.js';

export type WrapFnResultAsync<TInstance, TDependenciesDefinitions extends IDefinitionToken<any, any>[]> =
  HasPromise<InstancesArray<TDependenciesDefinitions>> extends true ? Promise<TInstance> : TInstance;

export const fnDefinition = <TLifeTime extends LifeTime>(lifeTime: TLifeTime) => {
  return <TInstance, TDepsTokens extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[]>(
    ...args: [...TDepsTokens, (...args: AwaitedInstanceArray<TDepsTokens>) => TInstance]
  ): IDefinition<WrapFnResultAsync<TInstance, TDepsTokens>, TLifeTime> => {
    const fn = args.pop() as (...args: AwaitedInstanceArray<TDepsTokens>) => TInstance;
    const dependencies = args as unknown as TDepsTokens;

    return new FnDefinition(
      Symbol('fn'),
      lifeTime,
      fn as any, // TODO
      dependencies,
    ) as any;
  };
};

export const fn = Object.assign(fnDefinition(LifeTime.transient), {
  singleton: fnDefinition(LifeTime.singleton),
  scoped: fnDefinition(LifeTime.scoped),
  cascading: fnDefinition(LifeTime.cascading),
});
