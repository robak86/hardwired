import { Definition } from '../../definitions/abstract/Definition.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { IBindingRegistryRead } from '../../context/BindingsRegistry.js';
import { IInstancesStoreRead } from '../../context/InstancesStore.js';
import { ScopeTag } from '../IContainer.js';

// TODO: perhaps we should provide container (the same simplified version as for fn(...)) instance to onEnter, onLeave, onScope?
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
