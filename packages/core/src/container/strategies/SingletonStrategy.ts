import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IServiceLocator } from '../IContainer.js';
import type { InstancesStore } from '../../context/InstancesStore.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';
import type { IInterceptor } from '../interceptors/interceptor.js';
import type { MaybeAsync } from '../../utils/MaybeAsync.js';

export class SingletonStrategy {
  constructor(protected instancesStore: InstancesStore) {}

  build<TValue>(
    definition: IDefinition<TValue, LifeTime>,
    locator: IServiceLocator,
    interceptor: IInterceptor,
  ): MaybeAsync<TValue> {
    return this.upsertIntoRootInstances(definition, locator, interceptor);
  }

  protected upsertIntoRootInstances<TInstance>(
    definition: IDefinition<TInstance, LifeTime>,
    container: IServiceLocator,
    interceptor: IInterceptor,
  ): MaybeAsync<TInstance> {
    if (this.instancesStore.hasRootInstance(definition.id)) {
      return this.instancesStore.getRootInstance(definition.id) as MaybeAsync<TInstance>;
    } else {
      const instance = definition.create(container, interceptor);

      this.instancesStore.setRootInstance(definition.id, instance);

      return instance;
    }
  }
}
