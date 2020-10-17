import { ModuleId } from '../module/ModuleId';
import invariant from 'tiny-invariant';
import { ModuleLookup } from '../module/ModuleLookup';

import { ImmutableSet } from '../collections/ImmutableSet';
import { Module } from '../module/Module';
import { ModuleResolverService } from "../resolvers/ModuleResolver";

export type ContainerCacheEntry = {
  // requestId:string;
  value: any;
};

class PushPromise<T> {
  resolve!: (value: T | Promise<T>) => void;
  public readonly promise: Promise<T>;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      setTimeout(() => {
        reject('timeout'); // TODO: add correct errors handling
      }, 10000);
    });
  }

  get(): Promise<T> {
    return this.promise;
  }

  push(value: T | Promise<T>) {
    if (!this.resolve) {
      throw new Error('race condition related to promise constructor');
    }

    this.resolve(value);
  }
}

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
