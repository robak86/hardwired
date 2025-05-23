import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../utils/async.js';
import type { IServiceLocator } from '../IContainer.js';
import type { InstancesStore } from '../../context/InstancesStore.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';
import type { IInterceptor } from '../interceptors/interceptor.js';

export class ScopedStrategy {
  constructor(protected instancesStore: InstancesStore) {}

  build<TValue>(
    definition: IDefinition<TValue, LifeTime>,
    locator: IServiceLocator,
    interceptor?: IInterceptor,
  ): MaybePromise<TValue> {
    return this.upsertIntoScopeInstances(definition, locator, interceptor);
  }

  protected upsertIntoScopeInstances<TInstance>(
    definition: IDefinition<TInstance, any>,
    container: IServiceLocator,
    interceptor?: IInterceptor,
  ) {
    if (this.instancesStore.hasScopedInstance(definition.id)) {
      return this.instancesStore.getScopedInstance(definition.id) as TInstance;
    } else {
      const instance = definition.create(container, interceptor);

      this.instancesStore.setScopedInstance(definition.id, instance);

      return instance;
    }
  }
}
