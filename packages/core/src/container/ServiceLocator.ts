import { ContainerContext } from './ContainerContext';

import invariant from 'tiny-invariant';
import { MaterializedRecord, ModuleBuilder, ModuleEntriesRecord } from '../module/ModuleBuilder';
import { ImmutableSet } from '../collections/ImmutableSet';

type ServiceLocatorGet = {
  <TRegistryRecord extends ModuleEntriesRecord, K extends keyof MaterializedRecord<TRegistryRecord> & string>(
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

        const moduleResolver = requestContext.getModuleResolver(module.moduleId);
        invariant(moduleResolver, `Cannot find definition named: ${key} in module: ${module.moduleId.name}`);

        // TODO: use real injections
        return moduleResolver.build(key, requestContext, [], ImmutableSet.empty());
      },
    });
  }
}
