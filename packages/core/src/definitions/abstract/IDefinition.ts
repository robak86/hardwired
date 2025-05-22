import type { IServiceLocator } from '../../container/IContainer.js';
import type { IDefinitionSymbol } from '../def-symbol.js';
import type { MaybePromise } from '../../utils/async.js';
import type { INewInterceptor } from '../../container/interceptors/interceptor.js';

import type { LifeTime } from './LifeTime.js';

export type AnyDefinitionSymbol = IDefinitionSymbol<any, LifeTime>;

// TODO: don't inherit from IDefinitionSymbol. Just implement property: readonly symbol: IDefinitionSymbol<TInstance, TLifeTime>;
// IDefinition that can implicitly be used as IDefinitionSymbol is error-prone.
export interface IDefinition<TInstance, TLifeTime extends LifeTime> extends IDefinitionSymbol<TInstance, TLifeTime> {
  create(context: IServiceLocator, interceptor?: INewInterceptor): MaybePromise<TInstance>;

  override(createFn: (context: IServiceLocator) => MaybePromise<TInstance>): IDefinition<TInstance, TLifeTime>;

  // getGraph(instancesRegistry: BindingsRegistry): IDependenciesGraph<TInstance, TLifeTime>;
}
