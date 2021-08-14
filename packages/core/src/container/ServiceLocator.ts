import { Module, ModuleRecord } from '../module/Module';
import { InstancesCache } from '../context/InstancesCache';
import { ResolversRegistry } from '../context/ResolversRegistry';
import { NewContainerContext } from '../context/NewContainerContext';
import { createContainerId } from '../utils/fastId';
import { ModuleMaterialization } from '../context/ModuleMaterialization';

type ServiceLocatorGet = {
  <TRegistryRecord extends ModuleRecord, K extends keyof ModuleRecord.Materialized<TRegistryRecord> & string>(
    module: Module<TRegistryRecord>,
    key: K,
  ): ModuleRecord.Materialized<TRegistryRecord>[K];
};

export class ServiceLocator {
  private container: NewContainerContext;

  constructor(private instancesCache: InstancesCache, private resolversRegistry: ResolversRegistry) {
    this.container = new NewContainerContext(
      createContainerId(),
      resolversRegistry,
      instancesCache,
      new ModuleMaterialization(resolversRegistry),
    );
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    const requestContext = this.container.checkoutRequestScope();
    return requestContext.materialize(module);
  }

  withScope<T>(factory: (obj: { get: ServiceLocatorGet }) => T): T {
    const requestContext = this.container.checkoutRequestScope();

    return factory({
      get: (module, key) => {
        return requestContext.get(module, key as any)
      },
    });
  }
}
