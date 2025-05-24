import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../definitions/def-symbol.js';

import type { ICompositeInterceptor, IInterceptor, InterceptorClass } from './interceptor.js';

export class PassThroughInterceptor implements ICompositeInterceptor {
  static instance = new PassThroughInterceptor();

  append(): void {
    // noop;
  }

  findInstance<TInstance extends IInterceptor>(cls: InterceptorClass<TInstance>): TInstance {
    throw new Error(`Interceptor of type ${(cls as any).name} not found.`);
  }

  onInstance<TInstance>(
    instance: TInstance,
    _dependencies: unknown[],
    _token: IDefinitionToken<TInstance, LifeTime>,
    _dependenciesTokens: IDefinitionToken<unknown, LifeTime>[],
  ): TInstance {
    return instance;
  }

  onScope(): PassThroughInterceptor {
    return this;
  }
}

export class CompositeInterceptor implements IInterceptor {
  constructor(private _interceptors: IInterceptor[] = []) {}

  // TODO: slow for a lot interceptors!
  findInstance<TInstance extends IInterceptor>(cls: InterceptorClass<TInstance>): TInstance {
    return this._interceptors.find(interceptor => interceptor instanceof (cls as any)) as TInstance;
  }

  append(interceptor: IInterceptor) {
    // throw if _interceptors already have interceptor which is instance of the same class
    if (this._interceptors.some(existingInterceptor => existingInterceptor instanceof interceptor.constructor)) {
      throw new Error(`Interceptor of type ${interceptor.constructor.name} already registered.`);
    }

    this._interceptors.push(interceptor);
  }

  onInstance<TInstance>(
    instance: TInstance,
    dependencies: unknown[],
    token: IDefinitionToken<TInstance, LifeTime>,
    dependenciesTokens: IDefinitionToken<unknown, LifeTime>[],
  ): TInstance {
    return this._interceptors.reduce(
      (acc, interceptor) => interceptor.onInstance?.(acc, dependencies, token, dependenciesTokens) ?? acc,
      instance,
    );
  }

  onScope(): CompositeInterceptor {
    return new CompositeInterceptor(this._interceptors.map(interceptor => interceptor.onScope()));
  }
}
