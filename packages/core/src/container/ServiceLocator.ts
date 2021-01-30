import { ContainerContext } from './ContainerContext';
import invariant from 'tiny-invariant';
import { ModuleBuilder } from '../module/ModuleBuilder';
import { Module, ModuleRecord } from '../resolvers/abstract/Module';

type ServiceLocatorGet = {
  <TRegistryRecord extends ModuleRecord, K extends keyof ModuleRecord.Materialized<TRegistryRecord> & string>(
    module: ModuleBuilder<TRegistryRecord>,
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

        return instanceResolver.build(requestContext) as any;
      },
    });
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    const requestContext = this.containerContext.forNewRequest();
    return this.containerContext.materializeModule(module, requestContext);
  }
}
