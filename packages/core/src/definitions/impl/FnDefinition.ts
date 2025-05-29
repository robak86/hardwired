import type { IServiceLocator } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { MaybePromise } from '../../utils/async.js';
import type { ConstructorArgsTokens } from '../../configuration/dsl/new/shared/AddDefinitionBuilder.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import { MaybeAsync } from '../../utils/MaybeAsync.js';

import { Definition } from './Definition.js';
import { AbstractDefinition } from './AbstractDefinition.js';

export class FnDefinition<TInstance, TLifeTime extends LifeTime, TDeps extends any[]>
  extends AbstractDefinition<TInstance, TLifeTime>
  implements IDefinition<TInstance, TLifeTime>
{
  constructor(
    id: symbol,
    strategy: TLifeTime,

    public readonly createFn: (...deps: TDeps) => MaybePromise<TInstance>,
    public readonly _dependencies: ConstructorArgsTokens<TDeps, TLifeTime>,
  ) {
    super(id, strategy);
  }

  override(
    createFn: (context: IServiceLocator, interceptor: IInterceptor) => MaybeAsync<TInstance>,
  ): IDefinition<TInstance, TLifeTime> {
    return new Definition(this.id, this.strategy, createFn);
  }

  create(context: IServiceLocator, interceptor: IInterceptor): MaybeAsync<TInstance> {
    return context.resolveAll(...this._dependencies).then(awaitedDeps => {
      const instance = this.createFn(...(awaitedDeps as TDeps));

      return MaybeAsync.resolve(instance).then(awaitedInstance => {
        return interceptor.onInstance(awaitedInstance, awaitedDeps, this, this._dependencies);
      });
    });
  }
}
