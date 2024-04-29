import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { AsyncInstanceDefinition } from '../definitions/abstract/async/AsyncInstanceDefinition.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { ContainerContext } from './ContainerContext.js';

export type ContainerInterceptor = {
  onRequestStart?(definition: AnyInstanceDefinition<any, any, any>, context: ContainerContext): void;

  /**
   * Called on container.get(definition) after the instance is created.
   * Called only when the definition is sync.
   * It's called with the instance that was created.
   * The function should return the instance.
   * @param definition
   * @param context
   * @param instance
   */
  onRequestEnd?<T>(definition: AnyInstanceDefinition<T, any, any>, context: ContainerContext, instance: T): T;

  /**
   * Called on container.get(definition) after the instance is created.
   * Called only when the definition is async.
   * It's called with the instance that was created.
   * The function should return promise resolving to the instance.
   * @param definition
   * @param context
   * @param instance
   */
  onAsyncRequestEnd?<T>(
    definition: AsyncInstanceDefinition<T, any, any>,
    context: ContainerContext,
    instance: T,
  ): Promise<T>;

  /**
   * Called when the container starts building the definition.
   * @param definition
   */
  onDefinitionEnter?(definition: AnyInstanceDefinition<any, any, any>): void;

  interceptSync?<T>(definition: InstanceDefinition<T, any, any>, context: ContainerContext): T;
  interceptAsync?<T>(definition: AsyncInstanceDefinition<T, any, any>, context: ContainerContext): Promise<T>;
};
