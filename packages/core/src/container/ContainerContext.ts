import { ModuleId } from '../module/ModuleId';
import invariant from 'tiny-invariant';
import { PushPromise } from '../utils/PushPromise';
import { ContainerEvents } from './ContainerEvents';
import { Module } from '../resolvers/abstract/Module';
import { ImmutableSet } from '../collections/ImmutableSet';

// TODO: Create scope objects (request scope, global scope, ?modules scope?)
export class ContainerContext {
  static empty(): ContainerContext {
    return new ContainerContext();
  }

  public requestScope: Record<string, any> = {};
  public requestScopeAsync: Record<string, PushPromise<any>> = {};
  public containerEvents = new ContainerEvents();

  protected constructor(
    public globalScope: Record<string, any> = {},
    public modulesResolvers: Record<string, Module<any>> = {},
    public injections = ImmutableSet.empty(),
  ) {}

  setForGlobalScope(uuid: string, instance: any) {
    this.globalScope[uuid] = instance;
  }

  setForRequestScope(uuid: string, instance: any) {
    this.requestScope[uuid] = instance;
  }

  inject(module: Module<any>) {
    this.injections = this.injections.extend(module.moduleId.id, module);
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
    return this.requestScope[uuid];
  }

  getFromGlobalScope(uuid: string) {
    invariant(!!this.globalScope[uuid], `Dependency with given uuid doesn't exists in global scope`);
    return this.globalScope[uuid];
  }

  forNewRequest(): ContainerContext {
    return new ContainerContext(this.globalScope, this.modulesResolvers, this.injections);
  }

  loadModule(module: Module<any>) {
    if (!this.hasModule(module.moduleId)) {
      const moduleToBeLoaded = this.injections.hasKey(module.moduleId.id)
        ? this.injections.get(module.moduleId.id)
        : module;

      this.addModule(moduleToBeLoaded.moduleId, moduleToBeLoaded);
      moduleToBeLoaded.onInit && moduleToBeLoaded.onInit(this);
    }
  }

  hasModule(moduleId: ModuleId): boolean {
    return !!this.modulesResolvers[moduleId.id];
  }

  addModule(moduleId: ModuleId, moduleResolver: Module<any>) {
    invariant(!this.modulesResolvers[moduleId.id], `Module with id ${moduleId.id} already exists`);
    this.modulesResolvers[moduleId.id] = moduleResolver;
  }

  getModule(moduleId: ModuleId): Module<any> {
    const lookup = this.modulesResolvers[moduleId.id];
    invariant(lookup, `Cannot get module with id: ${moduleId.id}. Module does not exists with container context`);
    return lookup;
  }
}
