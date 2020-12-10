import { ContainerContext } from './ContainerContext';
import invariant from 'tiny-invariant';
import { ModuleBuilder, unit } from '../module/ModuleBuilder';
import { ImmutableSet } from '../collections/ImmutableSet';
import { unwrapThunk } from '../utils/Thunk';
import { DependencyResolverEvents } from '../resolvers/abstract/DependencyResolverEvents';
import { MaterializedRecord, Module } from '../resolvers/abstract/Module';

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
  <K extends Module.InstancesKeys<TModule> & string>(key: K): Module.Materialized<TModule>[K];
  <TLazyModule extends ModuleBuilder<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    module: TLazyModule,
    key: K,
  ): Module.Materialized<TLazyModule>[K];
};

export class Container<TModule extends ModuleBuilder<any>, C = {}> {
  constructor(
    private module: TModule,
    private containerContext: ContainerContext = ContainerContext.empty(),
    private context?: C,
  ) {
    this.containerContext.loadModule(module);
  }

  withScope<TReturn>(container: (container: Container<TModule>) => TReturn): TReturn {
    throw new Error('Implement me');
  }

  get: ContainerGet<TModule> = (nameOrModule, name?) => {
    if (typeof nameOrModule === 'string') {
      const module = this.containerContext.getModule(this.module.moduleId);

      invariant(module, `Dependency with name: ${nameOrModule} does not exist`);

      return module.get(nameOrModule, this.containerContext, ImmutableSet.empty()) as any;
    }

    if (nameOrModule instanceof Module) {
      if (!this.haveModule(nameOrModule)) {
        this.load(nameOrModule);
      }

      const module = this.containerContext.getModule(nameOrModule.moduleId);
      invariant(
        module,
        `Cannot find module for module name ${nameOrModule.moduleId.name} and id ${nameOrModule.moduleId.id} while getting definition named: ${name}`,
      );

      return module.get(name, this.containerContext);
    }

    invariant(false, 'Invalid module or name');
  };

  haveModule(module: Module<any>): boolean {
    return this.containerContext.hasModule(module.moduleId);
  }

  load(module: Module<any>) {
    invariant(!this.haveModule(module), `Module ${module.moduleId} is already loaded`);
    this.containerContext.loadModule(module);
  }

  getEvents<TRegistryRecord extends Module.EntriesRecord, K extends keyof MaterializedRecord<TRegistryRecord> & string>(
    module: Module<TRegistryRecord>,
    key: K,
  ): DependencyResolverEvents {
    if (!this.containerContext.hasModule(module.moduleId)) {
      this.containerContext.loadModule(module);
    }

    const resolver = unwrapThunk((module as any).registry.get(key).resolverThunk);

    if (resolver.kind === 'moduleResolver') {
      throw new Error('Cannot get events for module resolver');
    }
    return resolver.events;
  }

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

  // asObject(): MaterializeModule<TModule> {
  //   const obj = {};
  //   const cache = this.containerContext.forNewRequest();
  //   this.rootModuleLookup.forEachDependency((key, factory) => {
  //     obj[key] = factory.get(cache);
  //   });
  //
  //   return obj as any;
  // }
}

export function container(): Container<ModuleBuilder<{}>>;
export function container<TModule extends ModuleBuilder<any>>(m: TModule): Container<TModule>;
export function container<TModule extends ModuleBuilder<any>>(m?: TModule): unknown {
  const mod = m ? m : unit('root');
  const container = new Container(mod, ContainerContext.empty());
  return container as any;
}
