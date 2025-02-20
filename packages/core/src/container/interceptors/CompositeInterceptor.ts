import { Definition } from '../../definitions/abstract/Definition.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { IInterceptor } from './interceptor.js';
import { IBindingRegistryRead } from '../../context/BindingsRegistry.js';
import { IInstancesStoreRead } from '../../context/InstancesStore.js';
import { ScopeTag } from '../IContainer.js';

export class CompositeInterceptor<TInstance> implements IInterceptor<TInstance> {
  constructor(private _interceptors: IInterceptor<TInstance>[]) {}

  onEnter<TNewInstance>(
    definition: Definition<TNewInstance, LifeTime, any[]>,
    args: any[],
  ): IInterceptor<TNewInstance> {
    return new CompositeInterceptor(this._interceptors.map(interceptor => interceptor.onEnter(definition, args)));
  }

  onLeave(instance: TInstance, definition: Definition<TInstance, LifeTime, any[]>): TInstance {
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
