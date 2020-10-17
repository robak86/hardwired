import { ContainerContext } from './ContainerContext';
import { ModuleLookup } from '../module/ModuleLookup';

import { Module } from '../module/Module';
import { RegistryRecord } from '../module/RegistryRecord';
import invariant from 'tiny-invariant';
import { DependencyResolverEvents } from '../resolvers/abstract/AbstractDependencyResolver';

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
  <K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord> & string>(key: K): RegistryRecord.Materialized<
    TRegistryRecord
  >[K];
  <TRegistryRecord extends RegistryRecord, K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord> & string>(
    module: Module<TRegistryRecord>,
    key: K,
  ): RegistryRecord.Materialized<TRegistryRecord>[K];
};

export class Container<TRegistryRecord extends RegistryRecord = {}, C = {}> {
  // private rootResolver: ModuleResolver<any>;
  private rootModuleLookup: ModuleLookup<TRegistryRecord>;

  constructor(
    module: Module<TRegistryRecord>,
    private containerContext: ContainerContext = ContainerContext.empty(),
    private context?: C,
  ) {
    this.containerContext.loadModule(module);
    this.containerContext.initModule(module);

    this.rootModuleLookup = this.containerContext.getModule(module.moduleId);
  }

  withScope<TReturn>(container: (container: Container<TRegistryRecord>) => TReturn): TReturn {
    throw new Error('Implement me');
  }

  get: ContainerGet<TRegistryRecord> = (nameOrModule, name?) => {
    if (typeof nameOrModule === 'string') {
      const dependencyFactory = this.rootModuleLookup.getDependencyResolver(nameOrModule as any);

      invariant(dependencyFactory, `Dependency with name: ${nameOrModule} does not exist`);

      return dependencyFactory.get(this.containerContext.forNewRequest());
    }

    if (nameOrModule instanceof Module) {
      if (!this.containerContext.hasModule(nameOrModule.moduleId)) {
        this.load(nameOrModule);
        // this.rootResolver.onInit(this.containerContext);
      }

      const moduleLookup = this.containerContext.getModule(nameOrModule.moduleId);
      const dependencyResolver = moduleLookup.findDependencyFactory(nameOrModule.moduleId, name);
      invariant(
        dependencyResolver,
        `Cannot find dependency resolver for module name ${nameOrModule.moduleId.name} and id ${nameOrModule.moduleId.id} while getting definition named: ${name}`,
      );

      return dependencyResolver.get(this.containerContext.forNewRequest());
    }

    invariant('Invalid module or name');
  };

  load(module: Module<any>) {
    this.containerContext.loadModule(module, module.injections);
    let lookup = this.containerContext.getModule(module.moduleId);

    this.rootModuleLookup.appendChild(lookup); // TODO: not sure if we should maintain hierarchy for lookups (it may be created optionally as a cache while getting resolvers)
    this.containerContext.initModule(module);
  }

  getEvents<
    TRegistryRecord extends RegistryRecord,
    K extends RegistryRecord.DependencyResolversKeys<TRegistryRecord> & string
  >(module: Module<TRegistryRecord>, key: K): DependencyResolverEvents {
    if (!this.containerContext.hasModule(module.moduleId)) {
      this.containerContext.loadModule(module);
      let lookup = this.containerContext.getModule(module.moduleId);

      this.rootModuleLookup.appendChild(lookup); // TODO: not sure if we should maintain hierarchy for lookups (it may be created optionally as a cache while getting resolvers)
      this.containerContext.initModule(module);
    }

    const moduleLookup = this.containerContext.getModule(module.moduleId);
    const dependencyResolver = moduleLookup.findDependencyFactory(module.moduleId, key);
    invariant(
      dependencyResolver,
      `Cannot find dependency resolver for module name ${module.moduleId.name} and id ${module.moduleId.id} while getting definition named: ${key}`,
    );

    return dependencyResolver.events;
  }

  getMany: GetMany<RegistryRecord.DependencyResolversKeys<TRegistryRecord>> = (...args: any[]) => {
    const cache = this.containerContext.forNewRequest();

    return args.map(key => {
      const dependencyFactory = this.rootModuleLookup.getDependencyResolver(key as any);

      invariant(dependencyFactory, `Dependency with name: ${key} does not exist`);

      return dependencyFactory.get(cache);
    }) as any;
  };

  asObject(): RegistryRecord.Materialized<TRegistryRecord> {
    const obj = {};
    const cache = this.containerContext.forNewRequest();
    this.rootModuleLookup.forEachDependency((key, factory) => {
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
