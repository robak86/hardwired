import { DependencyResolver } from '../resolvers/DependencyResolver';
import { unwrapThunk } from '../utils/thunk';
import { containerProxyAccessor } from './container-proxy-accessor';
import { ContainerCache } from './container-cache';
import { DefinitionsSet } from '../module/DefinitionsSet';
import {
  MaterializedDefinitions,
  MaterializedModuleEntries,
  ModuleRegistry,
  ModuleRegistryContext,
  ModuleRegistryDefinitions,
  ModuleRegistryDefinitionsKeys,
} from '../module/ModuleRegistry';
import { ModuleBuilder } from '../builders/ModuleBuilder';

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

export type DeepGetReturn<
  K extends keyof MaterializedDefinitions<TModuleRegistry>,
  TModuleRegistry extends ModuleRegistry,
  TContainerRegistry extends ModuleRegistry
> = ModuleRegistryContext<TContainerRegistry> extends ModuleRegistryContext<TModuleRegistry>
  ? MaterializedModuleEntries<TModuleRegistry>[K]
  : DeepGetReturnErrorMessage;

// TODO: extract all code related to instantiation of definition into services

export class Container<R extends ModuleRegistry = {}, C = {}> {
  constructor(
    private registry: DefinitionsSet<R>,
    private cache: ContainerCache = new ContainerCache(),
    private context?: C,
  ) {}

  get = <K extends ModuleRegistryDefinitionsKeys<R>>(key: K): MaterializedDefinitions<R>[K] => {
    return this.getChild(this.cache.forNewRequest(), key as any); //
  };

  // TODO: returns proxified module object (reusing existing instance from cache if possible)
  getModuleInstance() {}

  getMany: GetMany<ModuleRegistryDefinitions<R>> = (...args: any[]) => {
    const cache = this.cache.forNewRequest();

    return args.map(dep => {
      return this.getChild(cache, dep);
    }) as any;
  };

  asObject(): MaterializedModuleEntries<R> {
    return containerProxyAccessor(this as any, this.cache.forNewRequest());
  }

  checkout(inherit: boolean): Container<R> {
    if (inherit) {
      return new Container(this.registry, this.cache, this.context);
    } else {
      return new Container(this.registry, new ContainerCache(), this.context);
    }
  }

  // TODO: this may breaks the encapsulation!!! is this really required ? it's not type safe!
  deepGet<TNextR extends ModuleRegistry, K extends keyof MaterializedDefinitions<TNextR>>(
    module: ModuleBuilder<TNextR>,
    key: K,
  ): DeepGetReturn<K, TNextR, R> {
    //TODO: it should be compared using id - because identity doesn't give any guarantee that given dependency is already registered
    let childModule: DefinitionsSet<any> | undefined = this.registry.isEqual(module.registry)
      ? this.registry
      : unwrapThunk(this.findModule(module.registry));

    if (!childModule) {
      console.warn('deepGet called with module which is not imported by any descendant module');
      childModule = module.registry;
    }

    //TODO: investigate if we should cache containers. If so we need import resolver, but since containers are almost stateless maybe caching is not mandatory ?!
    // if (this.cache[childModule.moduleId.id]) {
    //     return this.cache[childModule.moduleId.id].getChild(this.cache, key);
    // } else {

    //TODO: optimization - instead of creating new instance of Container, we should have services/functions which takes container, and cache as a paremeter
    // eg. getChild(registry, cache, key) - it would obviously mutate cache :/
    let childMaterializedModule: any = new Container(childModule as any, this.cache);

    childMaterializedModule.init(); // TODO: not sure if we should lazily initialize modules :/
    // this.cache[childModule.moduleId.id] = childMaterializedModule;
    return childMaterializedModule.getChild(this.cache, key); //TODO: we have to pass cache !!!!
    // }
  }

  private findModule(moduleIdentity: DefinitionsSet<any>): DefinitionsSet<any> | undefined {
    return this.registry.findModule(moduleIdentity);
  }

  //TODO: extract to class

  protected getChild(cache, dependencyKey: string) {
    if (this.context && this.context[dependencyKey]) {
      return this.context[dependencyKey];
    }

    if (this.registry.declarations.hasKey(dependencyKey)) {
      let declarationResolver: DependencyResolver<any, any> = this.registry.declarations.get(dependencyKey);
      return declarationResolver.build(this, this.context, cache);
    }

    if (this.registry.imports.hasKey(dependencyKey)) {
      let childModule = unwrapThunk(this.registry.imports.get(dependencyKey));

      //TODO: investigate if we should cache containers
      // if (cache[childModule.moduleId.id]) {
      //     return containerProxyAccessor(cache[childModule.moduleId.id], cache);
      // } else {
      let childMaterializedModule: any = new Container(childModule, this.cache);
      // cache[childModule.moduleId.id] = childMaterializedModule;
      return containerProxyAccessor(childMaterializedModule, cache); //TODO: we have to pass cache !!!!
      // }
    }

    throw new Error(`Cannot find dependency for ${dependencyKey} key`);
  }

  public init() {
    this.registry.forEachModule(registry => {
      if (this.cache.isInitialized(registry.moduleId)) {
        return;
      }

      const moduleContainer = new Container(registry, this.cache);
      registry.initializers.forEach(init => {
        init(containerProxyAccessor(moduleContainer, this.cache));
      });
      this.cache.markInitialized(registry.moduleId);
    });
  }
}

// TODO: currently in order to have correct TRegistry type we need pass union of exact implementations of ModuleBuilder - which forbids custom builders in user space
export function container<TRegistry extends ModuleRegistry>(
  m: ModuleBuilder<TRegistry>,
  ctx?: any,
): Container<TRegistry> {
  return new Container((m as any).registry, new ContainerCache(), ctx);
}
