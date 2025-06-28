import type { ClassType } from '../utils/class-type.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinitionToken } from '../DefinitionToken.js';
import type { ValidDependenciesLifeTime } from '../abstract/InstanceDefinitionDependency.js';
import type { AwaitedInstanceArray } from '../../container/Container.js';
import type { MaybePromise } from '../../utils/async.js';

import { AbstractDeferredDefinition } from './AbstractDeferredDefinition.js';

export class ClassDefinitionDeferred<
  TInstance,
  TLifeTime extends LifeTime,
  TDepsTokens extends IDefinitionToken<any, ValidDependenciesLifeTime<TLifeTime>>[],
> extends AbstractDeferredDefinition<TInstance, TLifeTime, TDepsTokens> {
  constructor(
    id: symbol,
    strategy: TLifeTime,
    protected readonly _class: ClassType<TInstance, AwaitedInstanceArray<TDepsTokens>>,
    _dependenciesWithArguments: TDepsTokens,
    _argsPositions: number[] = [],
  ) {
    super(id, strategy, _dependenciesWithArguments, _argsPositions);
  }

  createInstance(...deps: AwaitedInstanceArray<TDepsTokens>): MaybePromise<TInstance> {
    return new this._class(...(deps as AwaitedInstanceArray<TDepsTokens>));
  }
}
