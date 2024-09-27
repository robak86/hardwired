import { Definition } from '../definitions/abstract/Definition.js';
import { IContainer } from '../container/IContainer.js';

export type ContainerInterceptor = {
  onRequestStart?(definition: Definition<any, any, any>, context: IContainer): void;

  /**
   * Called on container.get(definition) after the instance is created.
   * Called only when the definition is sync.
   * It's called with the instance that was created.
   * The function should return the instance.
   * @param definition
   * @param context
   * @param instance
   */
  onRequestEnd?<T>(definition: Definition<T, any, any>, context: IContainer, instance: T): T;

  /**
   * Called on container.get(definition) after the instance is created.
   * Called only when the definition is async.
   * It's called with the instance that was created.
   * The function should return promise resolving to the instance.
   * @param definition
   * @param context
   * @param instance
   */

  /**
   * Called when the container starts building the definition.
   * @param definition
   */
  onDefinitionEnter?(definition: Definition<any, any, any>): void;
  interceptSync?<T>(definition: Definition<T, any, any>, context: IContainer): T;
};
