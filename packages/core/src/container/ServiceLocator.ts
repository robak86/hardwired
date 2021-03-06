import { ContainerContext } from '../context/ContainerContext';
import { Container } from './Container';
import { Module, ModuleRecord } from '../module/Module';
import { ContextScopes } from '../context/ContextScopes';
import { ContextService } from '../context/ContextService';

type ServiceLocatorGet = {
  <TRegistryRecord extends ModuleRecord, K extends keyof ModuleRecord.Materialized<TRegistryRecord> & string>(
    module: Module<TRegistryRecord>,
    key: K,
  ): ModuleRecord.Materialized<TRegistryRecord>[K];
};

export class ServiceLocator extends Container {
  constructor(containerContext: ContainerContext) {
    super(containerContext);
  }

  withScope<T>(factory: (obj: { get: ServiceLocatorGet }) => T): T {
    const requestContext = ContextScopes.checkoutRequestScope(this.containerContext);

    return factory({
      get: (module, key) => {
        const instanceResolver = ContextService.getModuleInstanceResolver(module, key, requestContext);
        return ContextService.runInstanceDefinition(instanceResolver, requestContext);
      },
    });
  }
}
