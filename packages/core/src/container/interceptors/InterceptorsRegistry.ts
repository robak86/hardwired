import { IInterceptor } from './interceptor.js';
import { CompositeInterceptor } from './CompositeInterceptor.js';
import { ScopeTag } from '../IContainer.js';
import { IBindingRegistryRead } from '../../context/BindingsRegistry.js';
import { IInstancesStoreRead } from '../../context/InstancesStore.js';

export class InterceptorsRegistry {
  static create() {
    return new InterceptorsRegistry();
  }

  constructor(private _interceptors = new Map<symbol | string, IInterceptor<any>>()) {}

  get(id: string | symbol): IInterceptor<unknown> | undefined {
    return this._interceptors.get(id);
  }

  scope(
    tags: ScopeTag[],
    bindingsRegistry: IBindingRegistryRead,
    instancesStore: IInstancesStoreRead,
  ): InterceptorsRegistry {
    const _childScopeInterceptors = new Map<symbol | string, IInterceptor<any>>();

    this._interceptors.forEach((interceptor, id) => {
      _childScopeInterceptors.set(id, interceptor.onScope(tags, bindingsRegistry, instancesStore));
    });

    return new InterceptorsRegistry(_childScopeInterceptors);
  }

  register(id: string | symbol, interceptor: IInterceptor<unknown>): void {
    if (this._interceptors.has(id)) {
      throw new Error(`Interceptor with name ${id.toString()} already exists.`);
    }

    this._interceptors.set(id, interceptor);
  }

  build(): IInterceptor<any> | undefined {
    const interceptors = [...this._interceptors.values()];

    if (interceptors.length === 1) {
      return interceptors[0];
    }

    if (interceptors.length > 2) {
      return new CompositeInterceptor(interceptors);
    }
  }
}
