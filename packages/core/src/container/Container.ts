import { ContainerContext } from './ContainerContext';
import { ModuleLookup } from '../module/ModuleLookup';

import { RegistryRecord } from '../module/RegistryRecord';
import invariant from 'tiny-invariant';
import { DependencyResolverEvents } from '../resolvers/abstract/AbstractDependencyResolver';
import {
  MaterializedRecord,
  MaterializeModule,
  ModuleBuilder,
  ModuleEntriesRecord,
  ModuleEntry,
  ModuleInstancesKeys,
  ModuleRecordInstancesKeys,
} from '../module/ModuleBuilder';
import { Module } from '../resolvers/abstract/AbstractResolvers';
import { ImmutableSet } from "../collections/ImmutableSet";

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

type ContainerGet<TModule extends ModuleBuilder<any>> = {
  <K extends ModuleInstancesKeys<TModule> & string>(key: K): MaterializeModule<TModule>[K];
  <TLazyModule extends ModuleBuilder<any>, K extends ModuleInstancesKeys<TLazyModule> & string>(
    module: TLazyModule,
    key: K,
  ): MaterializeModule<TLazyModule>[K];
};

export class Container<TModule extends ModuleBuilder<any>, C = {}> {
  // private rootResolver: ModuleResolver<any>;
  // private rootModuleLookup: ModuleLookup<TRegistryRecord>;

  constructor(
    private module: TModule,
    private containerContext: ContainerContext = ContainerContext.empty(),
    private context?: C,
  ) {
    this.containerContext.loadModule(module);
    this.containerContext.initModule(module);

    // this.rootModuleLookup = this.containerContext.getModuleResolver(module.moduleId);
  }

  withScope<TReturn>(container: (container: Container<TModule>) => TReturn): TReturn {
    throw new Error('Implement me');
  }

  get: ContainerGet<TModule> = (nameOrModule, name?) => {
    if (typeof nameOrModule === 'string') {
      const moduleResolver = this.containerContext.getModuleResolver(this.module.moduleId);
      // // const dependencyFactory = this.rootModuleLookup.getDependencyResolver(nameOrModule as any);
      //
      invariant(moduleResolver, `Dependency with name: ${nameOrModule} does not exist`);
      //

      return moduleResolver.get(nameOrModule.split('.') as any, this.containerContext, ImmutableSet.empty()) as any;
    }

    // if (nameOrModule instanceof ModuleBuilder) {
    //   if (!this.containerContext.hasModule(nameOrModule.moduleId)) {
    //     this.containerContext.addModule(nameOrModule.moduleId, nameOrModule);
    //     this.load(nameOrModule);
    //     // this.rootResolver.onInit(this.containerContext);
    //   }
    //
    //   const moduleLookup = this.containerContext.getModule(nameOrModule.moduleId);
    //   const dependencyResolver = moduleLookup.findDependencyFactory(nameOrModule.moduleId, name);
    //   invariant(
    //     dependencyResolver,
    //     `Cannot find dependency resolver for module name ${nameOrModule.moduleId.name} and id ${nameOrModule.moduleId.id} while getting definition named: ${name}`,
    //   );
    //
    //   return dependencyResolver.get(this.containerContext.forNewRequest());
    // }

    invariant(false, 'Invalid module or name');
  };

  // load(module: ModuleBuilder<any>) {
  //   this.containerContext.loadModule(module, module.injections);
  //   const lookup = this.containerContext.getModuleResolver(module.moduleId);
  //
  //   this.rootModuleLookup.appendChild(lookup); // TODO: not sure if we should maintain hierarchy for lookups (it may be created optionally as a cache while getting resolvers)
  //   this.containerContext.initModule(module);
  // }

  getEvents<TRegistryRecord extends ModuleEntriesRecord, K extends keyof MaterializedRecord<TRegistryRecord> & string>(
    module: ModuleBuilder<TRegistryRecord>,
    key: K,
  ): DependencyResolverEvents {
    // if (!this.containerContext.hasModule(module.moduleId)) {
    //   this.containerContext.loadModule(module);
    //   const lookup = this.containerContext.getModuleResolver(module.moduleId);
    //
    //   this.rootModuleLookup.appendChild(lookup); // TODO: not sure if we should maintain hierarchy for lookups (it may be created optionally as a cache while getting resolvers)
    //   this.containerContext.initModule(module);
    // }

    throw new Error('implement me');
  }
  //
  //   const moduleLookup = this.containerContext.getModuleResolver(module.moduleId);
  //   const dependencyResolver = moduleLookup.findDependencyFactory(module.moduleId, key);
  //   invariant(
  //     dependencyResolver,
  //     `Cannot find dependency resolver for module name ${module.moduleId.name} and id ${module.moduleId.id} while getting definition named: ${key}`,
  //   );
  //
  //   return dependencyResolver.events;
  // }

  // getMany: GetMany<MaterializedRecord<TRegistryRecord>> = (...args: any[]) => {
  //   const cache = this.containerContext.forNewRequest();
  //
  //   return args.map(key => {
  //     const dependencyFactory = this.rootModuleLookup.getDependencyResolver(key as any);
  //
  //     invariant(dependencyFactory, `Dependency with name: ${key} does not exist`);
  //
  //     return dependencyFactory.get(cache);
  //   }) as any;
  // };

  // asObject(): MaterializedRecord<TRegistryRecord> {
  //   const obj = {};
  //   const cache = this.containerContext.forNewRequest();
  //   this.rootModuleLookup.forEachDependency((key, factory) => {
  //     obj[key] = factory.get(cache);
  //   });
  //
  //   return obj as any;
  // }
}

export function container<TModule extends ModuleBuilder<any>>(m: TModule, ctx?: any): Container<TModule> {
  const container = new Container(m, ContainerContext.empty(), ctx);
  return container as any;
}
