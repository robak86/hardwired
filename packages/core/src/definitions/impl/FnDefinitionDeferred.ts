import type { IServiceLocator } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { MaybePromise } from '../../utils/async.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { MaybeAsync } from '../../utils/MaybeAsync.js';
import type { IDefinitionToken } from '../DefinitionToken.js';
import type { Arguments } from '../builders/ArgumentPlaceholderToken.js';
import type { AwaitedInstanceArray } from '../../container/Container.js';
import type { ValidDependenciesLifeTime } from '../abstract/InstanceDefinitionDependency.js';

import { AbstractDeferredDefinition } from './AbstractDeferredDefinition.js';
import { Definition } from './Definition.js';

export class FnDefinitionDeferred<
  TInstance,
  TLifeTime extends LifeTime,
  TDepsTokens extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
> extends AbstractDeferredDefinition<TInstance, TLifeTime, TDepsTokens> {
  constructor(
    id: symbol,
    strategy: TLifeTime,
    _dependenciesWithArguments: TDepsTokens,
    _argsPositions: number[] = [],
    private readonly _createFn: (...deps: AwaitedInstanceArray<TDepsTokens>) => MaybePromise<TInstance>,
  ) {
    super(id, strategy, _dependenciesWithArguments, _argsPositions);
  }

  createInstance(...deps: AwaitedInstanceArray<TDepsTokens>): MaybePromise<TInstance> {
    return this._createFn(...deps);
  }

  override(
    createFn: (
      context: IServiceLocator,
      interceptor: IInterceptor,
    ) => MaybeAsync<(...args: Arguments<TDepsTokens>) => TInstance>,
  ): IDefinition<(...args: Arguments<TDepsTokens>) => TInstance, TLifeTime> {
    return new Definition(this.id, this.strategy, createFn);
  }
}
