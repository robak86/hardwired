import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IBindingRegistryRead } from '../../context/BindingsRegistry.js';
import type { IInstancesStoreRead } from '../../context/InstancesStore.js';
import type { ScopeTag } from '../IContainer.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';

import type { IInterceptor } from './interceptor.js';

export class CompositeInterceptor<TInstance> implements IInterceptor<TInstance> {
  constructor(private _interceptors: IInterceptor<TInstance>[]) {}

  onEnter<TNewInstance>(
    definition: IDefinition<TNewInstance, LifeTime, any[]>,
    args: any[],
  ): IInterceptor<TNewInstance> {
    return new CompositeInterceptor(this._interceptors.map(interceptor => interceptor.onEnter(definition, args)));
  }

  onLeave(instance: TInstance, definition: IDefinition<TInstance, LifeTime, any[]>): TInstance {
    return this._interceptors.reduce((acc, interceptor) => interceptor.onLeave(acc, definition), instance);
  }

  onScope(
    tags: ScopeTag[],
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoreRead,
  ): IInterceptor<TInstance> {
    return new CompositeInterceptor(
      this._interceptors.map(interceptor => interceptor.onScope(tags, bindingsRegistry, instancesStore)),
    );
  }

  append(interceptor: IInterceptor<TInstance>): CompositeInterceptor<TInstance> {
    return new CompositeInterceptor([...this._interceptors, interceptor]);
  }
}
