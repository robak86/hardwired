import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../utils/async.js';
import type { IServiceLocator } from '../IContainer.js';
import type { InstancesStore } from '../../context/InstancesStore.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';
import type { BindingsRegistry } from '../../context/BindingsRegistry.js';
import type { INewInterceptor } from '../interceptors/interceptor.js';

export class SingletonStrategy {
  constructor(
    protected instancesStore: InstancesStore,
    protected bindingsRegistry: BindingsRegistry,
  ) {}

  build<TValue>(
    definition: IDefinition<TValue, LifeTime>,
    locator: IServiceLocator,
    interceptor?: INewInterceptor,
  ): MaybePromise<TValue> {
    return this.upsertIntoRootInstances(definition, locator, interceptor);
  }

  protected upsertIntoRootInstances<TInstance>(
    definition: IDefinition<TInstance, LifeTime>,
    container: IServiceLocator,
    interceptor?: INewInterceptor,
  ) {
    if (this.instancesStore.hasRootInstance(definition.id)) {
      return this.instancesStore.getRootInstance(definition.id) as TInstance;
    } else {
      const instance = definition.create(container, interceptor);

      this.instancesStore.setRootInstance(definition.id, instance);

      return instance;
    }
  }
}
