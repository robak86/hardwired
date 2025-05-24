import type { IServiceLocator } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { MaybePromise } from '../../utils/async.js';
import type { ConstructorArgsSymbols } from '../../configuration/dsl/new/shared/AddDefinitionBuilder.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { IDefinitionToken } from '../def-symbol.js';
import { MaybeAsync } from '../../utils/MaybeAsync.js';

import { Definition } from './Definition.js';

export class FnDefinition<TInstance, TLifeTime extends LifeTime, TDeps extends any[]>
  implements IDefinition<TInstance, TLifeTime>
{
  constructor(
    public readonly token: IDefinitionToken<TInstance, TLifeTime>,

    public readonly createFn: (...deps: TDeps) => MaybePromise<TInstance>,
    public readonly _dependencies: ConstructorArgsSymbols<TDeps, TLifeTime>,
  ) {}

  get id() {
    return this.token.id;
  }

  get strategy() {
    return this.token.strategy;
  }

  override(
    createFn: (context: IServiceLocator, interceptor: IInterceptor) => MaybeAsync<TInstance>,
  ): IDefinition<TInstance, TLifeTime> {
    return new Definition(this.token, createFn);
  }

  create(context: IServiceLocator, interceptor: IInterceptor): MaybeAsync<TInstance> {
    return context.all(...this._dependencies).then(awaitedDeps => {
      const instance = this.createFn(...(awaitedDeps as TDeps));

      return MaybeAsync.resolve(instance).then(awaitedInstance => {
        return interceptor.onInstance(awaitedInstance, awaitedDeps, this.token, this._dependencies);
      });
    });
  }

  toString() {
    return this.token.toString();
  }
}
