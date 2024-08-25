import { ContainerContext } from './ContainerContext.js';
import { BaseDefinition } from '../definitions/abstract/FnDefinition.js';

export type ContainerInterceptor = {
  onRequestStart?(definition: BaseDefinition<any, any, any, any>, context: ContainerContext): void;

  /**
   * Called on container.get(definition) after the instance is created.
   * Called only when the definition is sync.
   * It's called with the instance that was created.
   * The function should return the instance.
   * @param definition
   * @param context
   * @param instance
   */
  onRequestEnd?<T>(definition: BaseDefinition<T, any, any, any>, context: ContainerContext, instance: T): T;

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
  onDefinitionEnter?(definition: BaseDefinition<any, any, any, any>): void;
  interceptSync?<T>(definition: BaseDefinition<T, any, any, any>, context: ContainerContext): T;
};
