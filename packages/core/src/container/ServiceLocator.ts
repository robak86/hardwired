import { ContainerContext } from "./ContainerContext";

import invariant from "tiny-invariant";
import { MaterializedRecord, ModuleBuilder, ModuleEntriesRecord } from "../module/ModuleBuilder";

type ServiceLocatorGet = {
  <TRegistryRecord extends ModuleEntriesRecord, K extends keyof MaterializedRecord<TRegistryRecord>>(
    module: ModuleBuilder<TRegistryRecord>,
    key: K,
  ): MaterializedRecord<TRegistryRecord>[K];
};

export class ServiceLocator {
  constructor(private containerContext: ContainerContext) {}

  withScope<T>(factory: (obj: { get: ServiceLocatorGet }) => T): T {
    const requestContext = this.containerContext.forNewRequest();

    return factory({
      get: (module, key) => {
        requestContext.loadModule(module);
        requestContext.initModule(module);

        const dependencyFactory = requestContext.getModule(module.moduleId).getDependencyResolver(key as string);
        invariant(dependencyFactory, `Cannot find definition named: ${key} in module: ${module.moduleId.name}`);
        return dependencyFactory.get(requestContext);
      },
    });
  }
}
