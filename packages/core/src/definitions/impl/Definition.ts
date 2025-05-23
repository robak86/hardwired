import type { IServiceLocator } from '../../container/IContainer.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { IDefinition } from '../abstract/IDefinition.js';
import type { MaybePromise } from '../../utils/async.js';
import { maybePromiseThen } from '../../utils/async.js';
import type { IDefinitionToken } from '../def-symbol.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';

export class Definition<TInstance, TLifeTime extends LifeTime> implements IDefinition<TInstance, TLifeTime> {
  constructor(
    public readonly token: IDefinitionToken<TInstance, TLifeTime>,
    private readonly _create: (context: IServiceLocator) => MaybePromise<TInstance>,
  ) {}

  create(context: IServiceLocator, interceptor?: IInterceptor): MaybePromise<TInstance> {
    return maybePromiseThen(this._create(context), awaited => {
      return interceptor?.onInstance?.(awaited, [], this.token, []) ?? awaited;
    });
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

  toString() {
    return this.token.toString();
  }
}
