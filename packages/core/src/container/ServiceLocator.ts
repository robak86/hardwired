import { ContainerContext } from './ContainerContext';
import invariant from 'tiny-invariant';

import { Module, ModuleRecord } from '../resolvers/abstract/Module';
import { IContainer } from './IContainer';

type ServiceLocatorGet = {
  <TRegistryRecord extends ModuleRecord, K extends keyof ModuleRecord.Materialized<TRegistryRecord> & string>(
    module: Module<TRegistryRecord>,
    key: K,
  ): ModuleRecord.Materialized<TRegistryRecord>[K];
};

export class ServiceLocator {
  constructor(private containerContext: ContainerContext) {}

  withScope<T>(factory: (obj: { get: ServiceLocatorGet }) => T): T {
    const requestContext = this.containerContext.forNewRequest();

    return factory({
      get: (module, key) => {
        const instanceResolver = requestContext.getInstanceResolver(module, key);
        invariant(instanceResolver, `Cannot find definition ${key}`);

        return requestContext.runResolver(instanceResolver, requestContext);
      },
    });
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    const requestContext = this.containerContext.forNewRequest();
    return this.containerContext.materializeModule(module, requestContext);
  }

  checkoutScope(overrides: Module<any>[]): IContainer {
    throw new Error('Implement me');
  }

  buildScope(builder): IContainer {
    throw new Error('Implement me');
  }
}
