import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../utils/async.js';
import type { IServiceLocator } from '../IContainer.js';
import type { InstancesStore } from '../../context/InstancesStore.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';
import type { BindingsRegistry } from '../../context/BindingsRegistry.js';
import type { INewInterceptor } from '../interceptors/interceptor.js';

export class ScopedStrategy {
  constructor(
    protected instancesStore: InstancesStore,
    protected bindingsRegistry: BindingsRegistry,
  ) {}

  build<TValue>(
    definition: IDefinition<TValue, LifeTime>,
    locator: IServiceLocator,
    interceptor?: INewInterceptor,
  ): MaybePromise<TValue> {
    return this.upsertIntoScopeInstances(definition, locator, interceptor);
  }

  protected upsertIntoScopeInstances<TInstance>(
    definition: IDefinition<TInstance, any>,
    container: IServiceLocator,
    interceptor?: INewInterceptor,
  ) {
    if (this.instancesStore.hasScopedInstance(definition.id)) {
      return this.instancesStore.getScopedInstance(definition.id) as TInstance;
    } else {
      const instance = definition.create(container, interceptor);

      // If the definition is bound to the current container then after calling definition.create
      // we already have the instance in the store, hence we should not register it for duplicated disposal.
      // TODO: remove this abomination
      // if (this.instancesStore.hasScopedInstance(definition.id)) {
      //   return this.instancesStore.getScopedInstance(definition.id) as TInstance;
      // }

      this.instancesStore.setScopedInstance(definition.id, instance);

      return instance;
    }
  }
}
