import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IInstancesStoreRead } from '../../context/InstancesStore.js';
import type { ScopeTag } from '../IContainer.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';
import type { IBindingsRegistryRead } from '../../context/abstract/IBindingsRegistryRead.js';
import type { ClassType } from '../../definitions/utils/class-type.js';

import type { IInterceptor, INewInterceptor } from './interceptor.js';

export class NewCompositeInterceptor implements INewInterceptor {
  constructor(private _interceptors: INewInterceptor[] = []) {}

  // TODO: slow for a lot interceptors!
  getInstance<TInstance>(cls: ClassType<TInstance, []>): TInstance {
    return this._interceptors.find(interceptor => interceptor instanceof cls) as TInstance;
  }

  append(interceptor: INewInterceptor) {
    // throw if _interceptors already have interceptor which is instance of the same class
    if (this._interceptors.some(existingInterceptor => existingInterceptor instanceof interceptor.constructor)) {
      throw new Error(`Interceptor of type ${interceptor.constructor.name} already registered.`);
    }

    this._interceptors.push(interceptor);
  }

  onInstance<TInstance>(instance: TInstance, dependencies: unknown[]): TInstance {
    return this._interceptors.reduce(
      (acc, interceptor) => interceptor.onInstance?.(acc, dependencies) ?? acc,
      instance,
    );
  }

  onScope(): this {
    return this;
  }
}

export class CompositeInterceptor<TInstance> implements IInterceptor<TInstance> {
  readonly id = crypto.randomUUID();

  constructor(private _interceptors: IInterceptor<TInstance>[]) {}

  onEnter<TNewInstance>(definition: IDefinition<TNewInstance, LifeTime>): IInterceptor<TNewInstance> {
    return new CompositeInterceptor(this._interceptors.map(interceptor => interceptor.onEnter(definition)));
  }

  onLeave(instance: TInstance, definition: IDefinition<TInstance, LifeTime>): TInstance {
    return this._interceptors.reduce((acc, interceptor) => interceptor.onLeave(acc, definition), instance);
  }

  onScope(
    tags: ScopeTag[],
    bindingsRegistry: IBindingsRegistryRead,
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
