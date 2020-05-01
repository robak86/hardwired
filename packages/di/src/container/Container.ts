import { DependencyResolver } from '../resolvers/DependencyResolver';
import { Module } from '../module/module';
import { Thunk, unwrapThunk } from '../utils/thunk';
import { DefinitionsRecord, ImportsRecord, MaterializedModuleEntries, ModuleEntries } from '../module/module-entries';
import { containerProxyAccessor } from './container-proxy-accessor';
import { ContainerCache } from './container-cache';

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

// TODO: extract all code related to instantiation of definition into services

export class Container<I extends ImportsRecord = {}, D extends DefinitionsRecord = {}, C = {}> {
  private cache: ContainerCache = new ContainerCache();

  constructor(private entries: ModuleEntries<I, D>, private context: C) {}

  get = <K extends keyof D>(key: K): D[K] => {
    //if is async container check if asyncDependenciesInitialized is true. if not throw an error
    return this.getChild(this.cache.forNewRequest(), key as any); //
  };

  // TODO: returns proxified module object (reusing existing instance from cache if possible)
  getModuleInstance() {}

  getMany: GetMany<D> = (...args: any[]) => {
    const cache = this.cache.forNewRequest();

    return args.map(dep => {
      return this.getChild(cache, dep);
    }) as any;
  };

  asObject(): MaterializedModuleEntries<I, D> {
    return containerProxyAccessor(this as any, this.cache.forNewRequest());
  }

  checkout(inherit: boolean): Container<I, D> {
    if (inherit) {
      return new Container(this.entries, { ...this.cache });
    } else {
      return new Container(this.entries, {});
    }
  }

  // TODO: this may breaks the encapsulation!!! is this really required ? it's not type safe!
  deepGet<I1 extends ImportsRecord, D2 extends DefinitionsRecord, K extends keyof MaterializedModuleEntries<I1, D2>>(
    module: Module<I1, D2>,
    key: K,
  ): MaterializedModuleEntries<I1, D2>[K] {
    let childModule: ModuleEntries | undefined = unwrapThunk(this.findModule(module.entries)); //TODO: it should be compared using id - because identity doesn't give any guarantee that given dependency is already registered

    if (!childModule) {
      console.warn('deepGet called with module which is not imported by any descendant module');
      childModule = module.entries;
    }

    //TODO: investigate if we should cache containers. If so we need import resolver, but since containers are almost stateless maybe caching is not mandatory ?!
    // if (this.cache[childModule.moduleId.id]) {
    //     return this.cache[childModule.moduleId.id].getChild(this.cache, key);
    // } else {
    let childMaterializedModule: any = new Container(childModule as any, this.context);
    // this.cache[childModule.moduleId.id] = childMaterializedModule;
    return childMaterializedModule.getChild(this.cache, key); //TODO: we have to pass cache !!!!
    // }
  }

  private findModule(moduleIdentity: ModuleEntries): ModuleEntries | undefined {
    return this.entries.findModule(moduleIdentity);
  }

  //TODO: extract to class

  protected getChild(cache, dependencyKey: string) {
    if (this.entries.declarations.hasKey(dependencyKey)) {
      let declarationResolver: DependencyResolver<any, any, any> = this.entries.declarations.get(dependencyKey);
      return declarationResolver.build(this, this.context, cache);
    }

    if (this.entries.imports.hasKey(dependencyKey)) {
      let childModule = unwrapThunk(this.entries.imports.get(dependencyKey));

      //TODO: investigate if we should cache containers
      // if (cache[childModule.moduleId.id]) {
      //     return containerProxyAccessor(cache[childModule.moduleId.id], cache);
      // } else {
      let childMaterializedModule: any = new Container(childModule, this.context);
      // cache[childModule.moduleId.id] = childMaterializedModule;
      return containerProxyAccessor(childMaterializedModule, cache); //TODO: we have to pass cache !!!!
      // }
    }

    throw new Error(`Cannot find dependency for ${dependencyKey} key`);
  }
}
