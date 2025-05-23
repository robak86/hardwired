import type { IServiceLocator } from '../../container/IContainer.js';
import type { IDefinitionToken } from '../def-symbol.js';
import type { MaybePromise } from '../../utils/async.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';

import type { LifeTime } from './LifeTime.js';

export type AnyDefinitionSymbol = IDefinitionToken<any, LifeTime>;

// TODO: don't inherit from IDefinitionSymbol. Just implement property: readonly symbol: IDefinitionSymbol<TInstance, TLifeTime>;
// IDefinition that can implicitly be used as IDefinitionSymbol is error-prone.
export interface IDefinition<TInstance, TLifeTime extends LifeTime> {
  readonly token: IDefinitionToken<TInstance, TLifeTime>;

  readonly id: symbol;
  readonly strategy: LifeTime;

  create(context: IServiceLocator, interceptor?: IInterceptor): MaybePromise<TInstance>;

  override(createFn: (context: IServiceLocator) => MaybePromise<TInstance>): IDefinition<TInstance, TLifeTime>;

  toString(): string;

  // getGraph(instancesRegistry: BindingsRegistry): IDependenciesGraph<TInstance, TLifeTime>;
}
