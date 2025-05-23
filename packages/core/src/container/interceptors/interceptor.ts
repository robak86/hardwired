import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../../definitions/def-symbol.js';

export type NewInterceptorClass<TInstance extends INewInterceptor> = {
  create(): TInstance;
};

export interface INewInterceptor {
  // TODO: ideally dependencies:unknown[] should be factory function, so interceptor can cancel dependencies creation
  onInstance?<TInstance>(
    instance: TInstance,
    dependencies: unknown[],
    token: IDefinitionToken<TInstance, LifeTime>,
    dependenciesTokens: IDefinitionToken<unknown, LifeTime>[],
  ): TInstance;

  onScope(): INewInterceptor;
}
