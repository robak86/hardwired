import { InstancesStore } from '../context/InstancesStore';
import { ContainerContext } from '../context/ContainerContext';
import { IServiceLocator } from './IServiceLocator';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry';
import { instanceDefinition, InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { AsyncInstancesStore } from '../context/AsyncInstancesStore';
import { ChildScopeOptions } from './Container';
import { AsyncInstanceDefinition } from '../definitions/abstract/AsyncInstanceDefinition';

export class ServiceLocator implements IServiceLocator {
  private containerContext: ContainerContext;

  constructor(
    private instancesCache: InstancesStore,
    private asyncInstancesCache: AsyncInstancesStore,
    private definitionsRegistry: InstancesDefinitionsRegistry,
  ) {
    this.containerContext = new ContainerContext(this.definitionsRegistry, instancesCache, asyncInstancesCache);
  }

  withRequestScope<T>(factory: (obj: IServiceLocator) => T): T {
    const serviceLocator = new ServiceLocator(
      this.instancesCache.checkoutForRequestScope(),
      this.asyncInstancesCache.checkoutForRequestScope(),
      this.definitionsRegistry.checkoutForRequestScope(),
    );

    return factory(serviceLocator);
  }

  checkoutScope(options: ChildScopeOptions = {}): IServiceLocator {
    const { scopeOverrides = [] } = options;
    const syncOverrides = scopeOverrides.filter(instanceDefinition.isSync);
    const asyncOverrides = scopeOverrides.filter(instanceDefinition.isAsync);

    return new ServiceLocator(
      this.instancesCache.childScope(syncOverrides),
      this.asyncInstancesCache.childScope(asyncOverrides),
      this.definitionsRegistry,
    );
  }

  get = <TValue>(instanceDefinition: InstanceDefinition<TValue>): TValue => {
    return this.containerContext.get(instanceDefinition);
  };

  getAsync<TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any>): Promise<TValue> {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.getAsync(instanceDefinition);
  }

  getAll<TLazyModule extends Array<InstanceDefinition<any>>>(
    ...definitions: TLazyModule
  ): { [K in keyof TLazyModule]: TLazyModule[K] extends InstanceDefinition<infer TInstance> ? TInstance : unknown } {
    const requestContext = this.containerContext.checkoutRequestScope();

    return definitions.map(def => requestContext.get(def)) as any;
  }
}
