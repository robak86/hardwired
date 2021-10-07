import { InstancesCache } from '../context/InstancesCache';
import { ContainerContext } from '../context/ContainerContext';
import { ModuleMaterialization } from '../context/ModuleMaterialization';
import { IServiceLocator } from './IServiceLocator';
import { InstancesDefinitionsRegistry } from '../context/InstancesDefinitionsRegistry';
import { instanceDefinition, InstanceDefinition } from '../definitions/InstanceDefinition';
import { AsyncInstancesCache } from '../context/AsyncInstancesCache';
import { ChildScopeOptions } from './Container';

export class ServiceLocator implements IServiceLocator {
  private containerContext: ContainerContext;

  constructor(
    private instancesCache: InstancesCache,
    private asyncInstancesCache: AsyncInstancesCache,
    private definitionsRegistry: InstancesDefinitionsRegistry,
  ) {
    this.containerContext = new ContainerContext(
      this.definitionsRegistry,
      instancesCache,
      asyncInstancesCache,
      new ModuleMaterialization(this.definitionsRegistry),
    );
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

  select = <TReturn>(inject: (ctx: ContainerContext) => TReturn): TReturn =>
    inject(this.containerContext.checkoutRequestScope());

  asObject = <TModule extends Record<string, InstanceDefinition<any>>>(
    module: TModule,
  ): { [K in keyof TModule]: TModule[K] extends InstanceDefinition<infer TValue> ? TValue : unknown } => {
    const requestContext = this.containerContext.checkoutRequestScope();
    return requestContext.materialize(module);
  };
}
