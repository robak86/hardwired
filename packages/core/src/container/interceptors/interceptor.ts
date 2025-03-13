import type { Definition } from '../../definitions/abstract/Definition.js';
import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IBindingRegistryRead } from '../../context/BindingsRegistry.js';
import type { IInstancesStoreRead } from '../../context/InstancesStore.js';
import type { ScopeTag } from '../IContainer.js';

export interface IInterceptor<TInstance> {
  configureRoot?(bindingRegistry: IBindingRegistryRead, instancesStore: IInstancesStoreRead): void;

  onEnter<TNewInstance>(definition: Definition<TNewInstance, LifeTime, any[]>, args: any[]): IInterceptor<TNewInstance>; // before create (definition becomes our origin)

  onLeave(instance: TInstance, definition: Definition<TInstance, LifeTime, any[]>): TInstance;

  onScope(
    tags: ScopeTag[],
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoreRead,
  ): IInterceptor<TInstance>;
}
