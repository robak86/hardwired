import { IServiceLocator } from '../../container/IContainer.js';
import { Definition } from './Definition.js';

export interface IInterceptor {
  // TODO: needs to be also called for any child definitions
  intercept<TInstance>(definition: Definition<TInstance, any, []>, use: IServiceLocator): TInstance;
}
