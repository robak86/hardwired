import { ContainerContext } from './ContainerContext';
import { RegistryLookup } from '../module/RegistryLookup';

import { Module } from '../module/Module';
import { ModuleResolver } from '../resolvers/ModuleResolver';
import { RegistryRecord } from '../module/RegistryRecord';
import invariant from 'tiny-invariant';

type GetMany<D> = {
  <K extends keyof D>(key: K): [D[K]];

  <K extends keyof D, K2 extends keyof D>(key: K, key2: K2): [D[K], D[K2]];

  <K extends keyof D, K2 extends keyof D, K3 extends keyof D>(key: K, key2: K2, key3: K3): [D[K], D[K2], D[K3]];

  <K extends keyof D, K2 extends keyof D, K3 extends keyof D, K4 extends keyof D>(
    key: K,
    key2: K2,
    key3: K3,
    key4: K4,
  ): [D[K], D[K2], D[K3], D[K4]];
};

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
  private registry: RegistryLookup<TRegistryRecord>;
  private lazyLoadedModules: RegistryLookup<TRegistryRecord>[] = [];

  constructor(
    module: Module<TRegistryRecord>,
    private containerContext: ContainerContext = ContainerContext.empty(),
    private context?: C,
  ) {
    this.rootResolver = new ModuleResolver<any>(module);
    this.registry = this.rootResolver.build(this.containerContext, module.injections);
  }

  get: ContainerGet<TRegistryRecord> = (nameOrModule, name?) => {
    if (typeof nameOrModule === 'string') {
      const dependencyFactory = this.registry.getDependencyResolver(nameOrModule as any);

      invariant(dependencyFactory, `Dependency with name: ${nameOrModule} does not exist`);

      return dependencyFactory.get(this.containerContext.forNewRequest());
    }

    if (nameOrModule instanceof Module) {
      const dependencyResolver = this.registry.findDependencyFactory(nameOrModule.moduleId, name as string);

      if (!dependencyResolver) {
        let moduleResolver = this.lazyLoadedModules.find(m => m.moduleId.id === nameOrModule.moduleId.id);
        if (!moduleResolver) {
          moduleResolver = new ModuleResolver(nameOrModule).build(this.containerContext, nameOrModule.injections);
          this.lazyLoadedModules.push(moduleResolver);
        }

        const lazyLoadedDependencyResolver = moduleResolver.findDependencyFactory(
          nameOrModule.moduleId,
          name as string,
        );

        invariant(
          lazyLoadedDependencyResolver,
          `Cannot find lazy loaded dependency resolver for name: ${name} and module: ${nameOrModule.moduleId.name}`,
        );

        return lazyLoadedDependencyResolver.get(this.containerContext.forNewRequest());
      }

      return dependencyResolver.get(this.containerContext.forNewRequest());
    }

    invariant('Invalid module or name');
  };

  getMany: GetMany<RegistryRecord.DependencyResolversKeys<TRegistryRecord>> = (...args: any[]) => {
    const cache = this.containerContext.forNewRequest();

    return args.map(key => {
      const dependencyFactory = this.registry.getDependencyResolver(key as any);

      invariant(dependencyFactory, `Dependency with name: ${key} does not exist`);

      return dependencyFactory.get(cache);
    }) as any;
  };

  asObject(): RegistryRecord.Materialized<TRegistryRecord> {
    const obj = {};
    const cache = this.containerContext.forNewRequest();
    this.registry.forEachDependency((key, factory) => {
      obj[key] = factory.get(cache);
    });

    return obj as any;
  }
}

export function container<TRegistryRecord extends RegistryRecord>(
  m: Module<TRegistryRecord>,
  ctx?: any,
): Container<TRegistryRecord> {
  let container = new Container(m, ContainerContext.empty(), ctx);
  return container as any;
}
