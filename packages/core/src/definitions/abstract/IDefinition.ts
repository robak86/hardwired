import type { IServiceLocator } from '../../container/IContainer.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { MaybeAsync } from '../../utils/MaybeAsync.js';
import type { IDefinitionToken } from '../DefinitionToken.js';

import type { LifeTime } from './LifeTime.js';

export type AnyDefinitionSymbol = IDefinitionToken<any, LifeTime>;

export const isDefinition = <TInstance, TLifeTime extends LifeTime>(
  definition: IDefinition<TInstance, TLifeTime> | IDefinitionToken<TInstance, TLifeTime>,
): definition is IDefinition<TInstance, TLifeTime> => {
  // TODO: fragile check
  return (definition as IDefinition<TInstance, TLifeTime>).create !== undefined;
};

export interface IDefinition<TInstance, TLifeTime extends LifeTime> extends IDefinitionToken<TInstance, TLifeTime> {
  create(context: IServiceLocator, interceptor: IInterceptor): MaybeAsync<TInstance>;

  override(
    createFn: (context: IServiceLocator, interceptor: IInterceptor) => MaybeAsync<TInstance>,
  ): IDefinition<TInstance, TLifeTime>;

  bind(container: IServiceLocator): IDefinition<TInstance, TLifeTime>;

  toString(): string;
}
