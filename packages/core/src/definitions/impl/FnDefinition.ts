import type { IServiceLocator } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { MaybePromise } from '../../utils/async.js';
import { isThenable } from '../../utils/IsThenable.js';
import type { ConstructorArgsSymbols } from '../../configuration/dsl/new/shared/AddDefinitionBuilder.js';
import type { INewInterceptor } from '../../container/interceptors/interceptor.js';
import type { IDefinitionToken } from '../def-symbol.js';

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

  override(createFn: (context: IServiceLocator) => MaybePromise<TInstance>): IDefinition<TInstance, TLifeTime> {
    return new Definition(this.token, createFn);
  }

  // TODO: it's a mess with this MaybePromise and interceptor
  create(context: IServiceLocator, interceptor?: INewInterceptor): MaybePromise<TInstance> {
    // no dependencies
    if (this._dependencies === undefined) {
      // @ts-ignore
      const instance = this.createFn();

      if (isThenable(instance)) {
        return instance.then(instance => {
          return interceptor?.onInstance?.(instance, []) ?? instance;
        }) as TInstance;
      } else {
        this._hasOnlySyncDependencies = true;

        return instance;
      }
    }

    const deps = context.all(...this._dependencies);

    if (this._hasOnlySyncDependencies) {
      const instance = this.createFn(...(deps as TDeps));

      if (isThenable(instance)) {
        return instance.then(instance => {
          return interceptor?.onInstance?.(instance, []) ?? instance;
        }) as TInstance;
      } else {
        return instance;
      }
    }

    if (isThenable(deps)) {
      return deps.then(deps => {
        const instance = this.createFn(...deps);

        if (isThenable(instance)) {
          return instance.then(instance => {
            return interceptor?.onInstance?.(instance, []) ?? instance;
          }) as TInstance;
        } else {
          return instance;
        }
      }) as TInstance;
    } else {
      this._hasOnlySyncDependencies = true;

      const instance = this.createFn(...(deps as TDeps));

      if (isThenable(instance)) {
        return instance.then(instance => {
          return interceptor?.onInstance?.(instance, []) ?? instance;
        }) as TInstance;
      } else {
        return instance;
      }
    }
  }

  toString() {
    return this.token.toString();
  }
}
