import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IBindingRegistryRead } from '../../context/BindingsRegistry.js';
import type { IInstancesStoreRead } from '../../context/InstancesStore.js';
import type { ScopeTag } from '../IContainer.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';

export interface IInterceptor<TInstance> {
  configureRoot?(bindingRegistry: IBindingRegistryRead, instancesStore: IInstancesStoreRead): void;

  onEnter<TNewInstance>(definition: IDefinition<TNewInstance, LifeTime>): IInterceptor<TNewInstance>; // before create (definition becomes our origin)

  onLeave(instance: TInstance, definition: IDefinition<TInstance, LifeTime>): TInstance;

  onScope(
    tags: ScopeTag[],
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoreRead,
  ): IInterceptor<TInstance>;
}
