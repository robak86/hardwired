import { ContainerContext } from './ContainerContext';
import invariant from 'tiny-invariant';
import { ModuleBuilder } from '../module/ModuleBuilder';
import { MaterializedRecord, Module } from '../resolvers/abstract/Module';

type ServiceLocatorGet = {
  <TRegistryRecord extends Module.EntriesRecord, K extends keyof MaterializedRecord<TRegistryRecord> & string>(
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
        const instanceResolver = requestContext.getInstanceResolver(module, key);
        invariant(instanceResolver, `Cannot find definition named: ${key} in module: ${module.moduleId.name}`);

        // TODO: use real injections
        return instanceResolver.build(requestContext) as any;
      },
    });
  }
}
