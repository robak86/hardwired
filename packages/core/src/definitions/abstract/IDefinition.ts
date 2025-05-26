import type { IServiceLocator } from '../../container/IContainer.js';
import type { IDefinitionToken } from '../def-symbol.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { MaybeAsync } from '../../utils/MaybeAsync.js';

import type { LifeTime } from './LifeTime.js';

export type AnyDefinitionSymbol = IDefinitionToken<any, LifeTime>;

export interface IDefinition<TInstance, TLifeTime extends LifeTime> extends IDefinitionToken<TInstance, TLifeTime> {
  create(context: IServiceLocator, interceptor: IInterceptor): MaybeAsync<TInstance>;

  override(
    createFn: (context: IServiceLocator, interceptor: IInterceptor) => MaybeAsync<TInstance>,
  ): IDefinition<TInstance, TLifeTime>;

  toString(): string;
}
