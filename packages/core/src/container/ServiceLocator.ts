import { ContainerContext } from "./ContainerContext";
import { RegistryRecord } from "../module/RegistryRecord";
import { Module } from "../module/Module";
import { ModuleResolver } from "../resolvers/ModuleResolver";
import invariant from "tiny-invariant";

type ServiceLocatorGet = {
  <TRegistryRecord extends RegistryRecord, K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>>(
    module: Module<TRegistryRecord>,
    key: K,
  ): RegistryRecord.Materialized<TRegistryRecord>[K];
};

export class ServiceLocator {
  constructor(private containerContext: ContainerContext) {}

  withScope<T>(factory: (obj: { get: ServiceLocatorGet }) => T): T {
    const requestContext = this.containerContext.forNewRequest();

    return factory({
      get: (module, key) => {
        const resolver = new ModuleResolver(module);
        const dependencyFactory = resolver.build(requestContext).getDependencyResolver(key as string);
        invariant(dependencyFactory, `Cannot find definition named: ${key} in module: ${module.moduleId.name}`);
        return dependencyFactory(requestContext);
      },
    });
  }
}
