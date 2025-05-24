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
  private _hasOnlySyncDependencies = false; // flag for optimization, so we don't have to check every time

  constructor(
    public readonly token: IDefinitionToken<TInstance, TLifeTime>,

    public readonly createFn: (...deps: TDeps) => MaybePromise<TInstance>,
    public readonly _dependencies: ConstructorArgsSymbols<TDeps, TLifeTime>,
  ) {
    this._hasOnlySyncDependencies = _dependencies.length === 0;
  }

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

  // TODO: it's a mess with this MaybePromise and interceptor
  create(context: IServiceLocator, interceptor: IInterceptor): MaybeAsync<TInstance> {
    // no dependencies
    if (this._dependencies === undefined) {
      // @ts-ignore
      const instance = this.createFn();

      return MaybeAsync.resolve(instance).then(awaited => {
        return interceptor.onInstance(awaited, [], this.token, this._dependencies);
      });
    }

    const result = context.all(...this._dependencies).then(awaitedDeps => {
      const instance = this.createFn(...(awaitedDeps as TDeps));

      return MaybeAsync.resolve(instance).then(awaitedInstance => {
        return interceptor.onInstance(awaitedInstance, awaitedDeps, this.token, this._dependencies);
      });
    });

    if (result.isSync) {
      // TODO: If the result is synchronous, we can set remember that and next time dispatch only synchronously
    }

    return result;
  }

  toString() {
    return this.token.toString();
  }
}
