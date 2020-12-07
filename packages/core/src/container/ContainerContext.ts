import { ModuleId } from '../module/ModuleId';
import invariant from 'tiny-invariant';

import { ImmutableSet } from '../collections/ImmutableSet';
import { PushPromise } from '../utils/PushPromise';
import { Module } from '../resolvers/abstract/AbstractResolvers';

export type ContainerCacheEntry = {
  value: any;
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
    public modulesResolvers: Record<string, Module<any>> = {},
    private _isScoped: boolean = false,
  ) {}

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
    return new ContainerContext(this.globalScope, this.modulesResolvers, true);
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

  loadModule(module: Module<any>) {
    if (!this.hasModule(module.moduleId)) {
      module.onInit && module.onInit(this);
      this.addModule(module.moduleId, module);
    }
  }

  initModule(module: Module<any>) {
    // const moduleLookup = containerContext.getModuleResolver(module.moduleId);
    //
    // moduleLookup.forEachModuleResolver(module => {
    //   ModuleResolverService.onInit(module, containerContext);
    // });
    //
    // moduleLookup.freezeImplementations();
    //
    // moduleLookup.forEachDependencyResolver(resolver => {
    //   const onInit = resolver.onInit;
    //   onInit && onInit.call(resolver, moduleLookup);
    // });
  }

  hasModule(moduleId: ModuleId): boolean {
    return !!this.modulesResolvers[moduleId.id];
  }

  getModule(moduleId: ModuleId): Module<any> {
    const lookup = this.modulesResolvers[moduleId.id];
    invariant(lookup, `Cannot get module with id: ${moduleId.id}. Module does not exists with container context`);
    return lookup;
  }

  addModule(moduleId: ModuleId, moduleResolver: Module<any>) {
    invariant(!this.modulesResolvers[moduleId.id], `Module with id ${moduleId.id} already exists`);
    this.modulesResolvers[moduleId.id] = moduleResolver;
  }
}
