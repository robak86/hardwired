import invariant from 'tiny-invariant';
import { isInstanceDefinition, Module, ModuleRecord } from '../module/Module';
import { IContainer } from './IContainer';
import { ContainerContext } from '../context/ContainerContext';
import { ContextService } from '../context/ContextService';
import { ContextScopes } from '../context/ContextScopes';

type ServiceLocatorGet = {
  <TRegistryRecord extends ModuleRecord, K extends keyof ModuleRecord.Materialized<TRegistryRecord> & string>(
    module: Module<TRegistryRecord>,
    key: K,
  ): ModuleRecord.Materialized<TRegistryRecord>[K];
};

export class ServiceLocator {
  constructor(private containerContext: ContainerContext) {}

  withScope<T>(factory: (obj: { get: ServiceLocatorGet }) => T): T {
    const requestContext = ContextScopes.checkoutRequestScope(this.containerContext);

    return factory({
      get: (module, key) => {
        const instanceResolver = ContextService.getModuleInstanceResolver(module, key, requestContext);
        return ContextService.runInstanceDefinition(instanceResolver, requestContext);
      },
    });
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    const requestContext = ContextScopes.checkoutRequestScope(this.containerContext);
    return ContextService.materializeWithAccessors(module, requestContext);
  }

  checkoutScope(overrides: Module<any>[]): IContainer {
    throw new Error('Implement me');
  }

  buildScope(builder): IContainer {
    throw new Error('Implement me');
  }
}
