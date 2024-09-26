import { IServiceLocator } from '../../container/IContainer.js';
import { BaseDefinition } from './BaseDefinition.js';

export interface IInterceptor {
  // TODO: needs to be also called for any child definitions
  intercept<TInstance>(definition: BaseDefinition<TInstance, any, any, []>, use: IServiceLocator): TInstance;
}
