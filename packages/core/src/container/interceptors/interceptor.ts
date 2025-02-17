import { Definition } from '../../definitions/abstract/Definition.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { IBindingRegistryRead } from '../../context/BindingsRegistry.js';
import { IInstancesStoryRead } from '../../context/InstancesStore.js';
import { ScopeTag } from '../IContainer.js';

export interface IInterceptor<TInstance> {
  onEnter<TNewInstance>(
    definition: Definition<TNewInstance, LifeTime, any[]>,
    args: any[],
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoryRead,
  ): IInterceptor<TNewInstance>; // before create (definition becomes our origin)

  onLeave(
    instance: TInstance,
    definition: Definition<TInstance, LifeTime, any[]>,
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoryRead,
  ): TInstance;

  onScope(tags: ScopeTag[]): IInterceptor<TInstance>;
}
