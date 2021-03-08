import invariant from 'tiny-invariant';
import { Module, ModuleRecord } from '../resolvers/abstract/Module';
import { IContainer } from './IContainer';
import { ContainerContext } from '../context/ContainerContext';
import { ContextService } from '../context/ContextService';

type ServiceLocatorGet = {
  <TRegistryRecord extends ModuleRecord, K extends keyof ModuleRecord.Materialized<TRegistryRecord> & string>(
    module: Module<TRegistryRecord>,
    key: K,
  ): ModuleRecord.Materialized<TRegistryRecord>[K];
};

export class ServiceLocator {
  constructor(private containerContext: ContainerContext) {}

  withScope<T>(factory: (obj: { get: ServiceLocatorGet }) => T): T {
    const requestContext = ContainerContext.checkoutRequestScope(this.containerContext);

    return factory({
      get: (module, key) => {
        const instanceResolver = ContextService.getInstanceResolver(module, key, requestContext);
        invariant(instanceResolver, `Cannot find definition ${key}`);

        return ContextService.runInstanceDefinition(instanceResolver, requestContext);
      },
    });
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    const requestContext = ContainerContext.checkoutRequestScope(this.containerContext);
    return ContextService.materializeModule(module, requestContext);
  }

  checkoutScope(overrides: Module<any>[]): IContainer {
    throw new Error('Implement me');
  }

  buildScope(builder): IContainer {
    throw new Error('Implement me');
  }
}
