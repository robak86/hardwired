import { ContainerCache } from './container-cache';
import { ModuleRegistry } from '../module/ModuleRegistry';

import { Module } from '../builders/Module';
import { ModuleResolver } from '../resolvers/ModuleResolver';
import { RegistryRecord } from '../module/RegistryRecord';
import invariant from 'tiny-invariant';

interface GetMany<D> {
  <K extends keyof D>(key: K): [D[K]];

  <K extends keyof D, K2 extends keyof D>(key: K, key2: K2): [D[K], D[K2]];

  <K extends keyof D, K2 extends keyof D, K3 extends keyof D>(key: K, key2: K2, key3: K3): [D[K], D[K2], D[K3]];

  <K extends keyof D, K2 extends keyof D, K3 extends keyof D, K4 extends keyof D>(
    key: K,
    key2: K2,
    key3: K3,
    key4: K4,
  ): [D[K], D[K2], D[K3], D[K4]];
}

export type DeepGetReturnErrorMessage = `Given module cannot be used with deepGet because module's context is missing in the container`;
//
// export type DeepGetReturn<
//   K extends keyof MaterializedDefinitions<TModuleRegistry>,
//   TModuleRegistry extends RegistryRecord,
//   TContainerRegistry extends RegistryRecord
// > = ModuleRegistryContext<TContainerRegistry> extends ModuleRegistryContext<TModuleRegistry>
//   ? MaterializedModuleEntries<TModuleRegistry>[K]
//   : DeepGetReturnErrorMessage;

// TODO: accept custom ModuleResolver (may be necessary, e.g. for react containers ?)
// or for sake of compatibility, EagerModuleResolver, ProxyModuleResolver, etc

type ContainerGet<TRegistryRecord extends RegistryRecord> = {
  <K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>>(key: K): RegistryRecord.Materialized<
    TRegistryRecord
  >[K];
  <TRegistryRecord extends RegistryRecord, K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord>>(
    module: Module<TRegistryRecord>,
    key: K,
  ): RegistryRecord.Materialized<TRegistryRecord>[K];
};

export class Container<TRegistryRecord extends RegistryRecord = {}, C = {}> {
  private rootResolver: ModuleResolver<any>;
  private registry: ModuleRegistry;

  constructor(
    Module: Module<TRegistryRecord>,
    private cache: ContainerCache = new ContainerCache(),
    private context?: C,
  ) {
    this.rootResolver = new ModuleResolver<any>(Module);
    this.registry = this.rootResolver.build(Module.injections)[1];
  }

  get: ContainerGet<TRegistryRecord> = (nameOrModule, name?) => {
    if (typeof nameOrModule === 'string') {
      const dependencyFactory = this.registry.getDependencyResolver(nameOrModule as any);

      invariant(dependencyFactory, `Dependency with name: ${nameOrModule} does not exist`);

      return dependencyFactory(this.cache.forNewRequest());
    } else {
      const dependencyResolver = this.registry.findDependencyFactory(nameOrModule.moduleId, name as string);
      invariant(
        dependencyResolver,
        `Cannot find dependency resolver for name: ${name} and module: ${nameOrModule.moduleId.name}`,
      );

      return dependencyResolver(this.cache.forNewRequest());
    }
  };

  getMany: GetMany<RegistryRecord.DependencyResolversKeys<TRegistryRecord>> = (...args: any[]) => {
    const cache = this.cache.forNewRequest();

    return args.map(key => {
      const dependencyFactory = this.registry.getDependencyResolver(key as any);

      invariant(dependencyFactory, `Dependency with name: ${key} does not exist`);

      return dependencyFactory(cache);
    }) as any;
  };

  asObject(): RegistryRecord.Materialized<TRegistryRecord> {
    const obj = {};
    const cache = this.cache.forNewRequest();
    this.registry.forEachDependency((key, factory) => {
      obj[key] = factory(cache);
    });

    return obj as any;
  }
}

export function container<TRegistryRecord extends RegistryRecord>(
  m: Module<TRegistryRecord>,
  ctx?: any,
): Container<TRegistryRecord> {
  let container = new Container(m, new ContainerCache(), ctx);
  return container as any;
}
