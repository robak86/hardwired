import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IBindingRegistryRead } from '../../context/BindingsRegistry.js';
import type { IInstancesStoreRead } from '../../context/InstancesStore.js';
import type { ScopeTag } from '../IContainer.js';
import type { IDefinitionSymbol } from '../../definitions/def-symbol.js';

export interface IInterceptor<TInstance> {
  configureRoot?(bindingRegistry: IBindingRegistryRead, instancesStore: IInstancesStoreRead): void;

  onEnter<TNewInstance>(definition: IDefinitionSymbol<TNewInstance, LifeTime>): IInterceptor<TNewInstance>; // before create (definition becomes our origin)

  onLeave(instance: TInstance, definition: IDefinitionSymbol<TInstance, LifeTime>): TInstance;

  onScope(
    tags: ScopeTag[],
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoreRead,
  ): IInterceptor<TInstance>;
}
