import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../definitions/def-symbol.js';

export type InterceptorClass<TInstance extends IInterceptor> = {
  create(): TInstance;
};

export interface ICompositeInterceptor extends IInterceptor {
  append(interceptor: IInterceptor): void;

  onScope(): ICompositeInterceptor;

  findInstance<TInstance extends IInterceptor>(cls: InterceptorClass<TInstance>): TInstance;
}

export interface IInterceptor {
  // TODO: ideally dependencies:unknown[] should be factory function, so interceptor can cancel dependencies creation
  onInstance<TInstance>(
    instance: TInstance,
    dependencies: unknown[],
    token: IDefinitionToken<TInstance, LifeTime>,
    dependenciesTokens: IDefinitionToken<unknown, LifeTime>[],
  ): TInstance;

  onScope(): IInterceptor;
}
