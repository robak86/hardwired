import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../definitions/DefinitionToken.js';
import type { ValidDependenciesLifeTime } from '../../definitions/abstract/InstanceDefinitionDependency.js';
import type { AwaitedInstanceArray } from '../../container/Container.js';

import type { FilterDepsByInstanceType } from './IRegisterAware.js';
import type { FinalizerOrVoid } from './IDisposeFinalizer.js';

export interface IInitBuilder<
  TInstance,
  TLifetime extends LifeTime,
  TDependencies extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifetime>>[],
> {
  using<TDeps extends readonly IDefinitionToken<any, ValidDependenciesLifeTime<TLifetime>>[]>(
    ...deps: FilterDepsByInstanceType<TInstance, TLifetime, TDeps>
  ): IInitBuilder<TInstance, TLifetime, [...TDependencies, ...TDeps]>;

  lazy(fn: (...dependencies: AwaitedInstanceArray<TDependencies>) => TInstance): FinalizerOrVoid<TInstance, TLifetime>;
  eager(fn: (...dependencies: AwaitedInstanceArray<TDependencies>) => TInstance): FinalizerOrVoid<TInstance, TLifetime>;
}
