import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IInstancesStoreRead } from '../../context/InstancesStore.js';
import type { ScopeTag } from '../IContainer.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';
import type { IBindingsRegistryRead } from '../../context/abstract/IBindingsRegistryRead.js';

export interface IInterceptor<TInstance> {
  readonly id: string;

  configureRoot?(bindingRegistry: IBindingsRegistryRead, instancesStore: IInstancesStoreRead): void;

  onEnter<TNewInstance>(definition: IDefinition<TNewInstance, LifeTime>): IInterceptor<TNewInstance>; // before create (definition becomes our origin)

  onLeave(instance: TInstance, definition: IDefinition<TInstance, LifeTime>): TInstance;

  onScope(
    tags: ScopeTag[],
    bindingsRegistry: IBindingsRegistryRead,
    instancesStore: IInstancesStoreRead,
  ): IInterceptor<TInstance>;
}
