import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../definitions/def-symbol.js';

import type { INewInterceptor, NewInterceptorClass } from './interceptor.js';

export class NewCompositeInterceptor implements INewInterceptor {
  constructor(private _interceptors: INewInterceptor[] = []) {}

  // TODO: slow for a lot interceptors!
  findInstance<TInstance extends INewInterceptor>(cls: NewInterceptorClass<TInstance>): TInstance {
    return this._interceptors.find(interceptor => interceptor instanceof (cls as any)) as TInstance;
  }

  append(interceptor: INewInterceptor) {
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

  onScope(): NewCompositeInterceptor {
    return new NewCompositeInterceptor(this._interceptors.map(interceptor => interceptor.onScope()));
  }
}
