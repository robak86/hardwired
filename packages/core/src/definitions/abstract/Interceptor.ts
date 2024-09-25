import { BaseDefinition } from './FnDefinition.js';
import { IServiceLocator } from '../../container/IContainer.js';

export interface IInterceptor {
  // TODO: needs to be also called for any child definitions
  intercept<TInstance>(definition: BaseDefinition<TInstance, any, any, []>, use: IServiceLocator): TInstance;
}
