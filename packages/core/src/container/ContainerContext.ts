import { ModuleId } from '../module/ModuleId';
import invariant from 'tiny-invariant';
import { ModuleLookup } from '../module/ModuleLookup';

import { ImmutableSet } from '../collections/ImmutableSet';
import { Module } from '../module/Module';
import { RegistryRecord } from '../module/RegistryRecord';
import { DefinitionResolver, DefinitionResolverFactory } from '../resolvers/DependencyResolver';
import { Instance } from '../resolvers/abstract/Instance';
import { PushPromise } from '../utils/PushPromise';

export type ContainerCacheEntry = {
  // requestId:string;
  value: any;
};

const ModuleResolverService = {
  load(module: Module<any>, containerContext: ContainerContext, injections = ImmutableSet.empty()) {
    if (!containerContext.hasModule(module.moduleId)) {
      // TODO: merge injections with own this.registry injections
      // TODO: lazy loading ? this method returns an object. We can return proxy or object with getters and setters (lazy evaluated)
      const context: RegistryRecord = {};
      const moduleLookup: ModuleLookup<any> = new ModuleLookup(module.moduleId);
      const mergedInjections = module.injections.merge(injections);

      module.registry.forEach((resolverFactory: DefinitionResolverFactory, key: string) => {
        // TODO: by calling resolverFactory with proxy object, we could automatically track all dependencies for change detection
        //  ...but we probably don't wanna have this feature in the responsibility of this DI solution?? What about compatibility(proxy object) ?
        const resolver: DefinitionResolver = resolverFactory(context);

        if (resolver.type === 'dependency') {
          //TODO: consider adding check for making sure that this function is not called in define(..., ctx => ctx.someDependency(...))
          context[key] = moduleLookup.instancesProxy.getReference(key);
          moduleLookup.dependencyResolvers[key] = resolver;
          moduleLookup.appendDependencyFactory(key, resolver, context[key] as Instance<any>);
        }

        if (resolver.type === 'module') {
          if (mergedInjections.hasKey(resolver.moduleId.identity)) {
            const injectedModule = mergedInjections.get(resolver.moduleId.identity);
            moduleLookup.modules[key] = injectedModule;
          } else {
            moduleLookup.modules[key] = resolver;
          }

          const childModuleResolver = moduleLookup.modules[key];

          ModuleResolverService.load(childModuleResolver, containerContext, mergedInjections);

          const childModuleLookup = containerContext.getModule(childModuleResolver.moduleId);

          context[key] = childModuleLookup.registry;
          moduleLookup.appendChild(childModuleLookup);
        }
      });

      containerContext.addModule(module.moduleId, moduleLookup);
    }
  },

  // TODO: should be somehow memoized ? don't wanna initialized already initialized module ?
  onInit(module: Module<any>, containerContext: ContainerContext) {
    const moduleLookup = containerContext.getModule(module.moduleId);

    moduleLookup.forEachModuleResolver(module => {
      ModuleResolverService.onInit(module, containerContext);
    });

    moduleLookup.freezeImplementations();

    moduleLookup.forEachDependencyResolver(resolver => {
      const onInit = resolver.onInit;
      onInit && onInit.call(resolver, moduleLookup);
    });
  },
};

// TODO: Create scope objects (request scope, global scope, ?modules scope?)
export class ContainerContext {
  static empty(): ContainerContext {
    return new ContainerContext();
  }

  public requestScope: Record<string, ContainerCacheEntry> = {};
  public requestScopeAsync: Record<string, PushPromise<any>> = {};
  public initializedModules: Record<string, any> = {};

  protected constructor(
    public globalScope: Record<string, ContainerCacheEntry> = {},
    public materializedModules: Record<string, ModuleLookup<any>> = {},
    private _isScoped: boolean = false,
  ) {}

  hasModule(moduleId: ModuleId): boolean {
    return !!this.materializedModules[moduleId.id];
  }

  getModule(moduleId: ModuleId): ModuleLookup<any> {
    const lookup = this.materializedModules[moduleId.id];
    invariant(lookup, `Cannot get module with id: ${moduleId.id}. Module does not exists with container context`);
    return lookup;
  }

  findModule(moduleId: ModuleId): ModuleLookup<any> | undefined {
    return this.materializedModules[moduleId.id];
  }

  addModule(moduleId: ModuleId, lookup: ModuleLookup<any>) {
    invariant(!this.materializedModules[moduleId.id], `Module with id ${moduleId.id} already exists`);
    this.materializedModules[moduleId.id] = lookup;
  }

  setForGlobalScope(uuid: string, instance: any) {
    this.globalScope[uuid] = {
      value: instance,
    };
  }

  setForRequestScope(uuid: string, instance: any) {
    this.requestScope[uuid] = {
      value: instance,
    };
  }

  hasInGlobalScope(uuid: string): boolean {
    return !!this.globalScope[uuid];
  }

  hasInRequestScope(uuid: string): boolean {
    return !!this.requestScope[uuid];
  }

  hasInAsyncRequestScope(uuid: string): boolean {
    return !!this.requestScopeAsync[uuid];
  }

  usingAsyncScope(uuid: string, cacheValueFactory: () => any): Promise<any> {
    this.requestScopeAsync[uuid] = new PushPromise();
    this.requestScopeAsync[uuid].push(cacheValueFactory());
    return this.requestScopeAsync[uuid].get();
  }

  getFromAsyncRequestScope(uuid: string): Promise<any> {
    invariant(!!this.requestScopeAsync[uuid], `Dependency with given uuid doesn't exists in request scope`);
    return this.requestScopeAsync[uuid].get();
  }

  getFromRequestScope(uuid: string) {
    invariant(!!this.requestScope[uuid], `Dependency with given uuid doesn't exists in request scope`);
    return this.requestScope[uuid].value;
  }

  getFromGlobalScope(uuid: string) {
    invariant(!!this.globalScope[uuid], `Dependency with given uuid doesn't exists in global scope`);
    return this.globalScope[uuid].value;
  }

  forNewRequest(): ContainerContext {
    return new ContainerContext(this.globalScope, this.materializedModules, true);
  }

  isScoped(): boolean {
    return this._isScoped;
  }

  isModuleInitialized(moduleId: ModuleId): boolean {
    return !!this.initializedModules[moduleId.id];
  }

  markModuleAsInitialized(moduleId: ModuleId) {
    this.initializedModules[moduleId.id] = true;
  }

  loadModule(module: Module<any>, injections = ImmutableSet.empty()) {
    ModuleResolverService.load(module, this, injections);
  }

  initModule(module: Module<any>) {
    ModuleResolverService.onInit(module, this);
  }
}
