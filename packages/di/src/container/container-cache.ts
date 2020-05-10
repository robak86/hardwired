import { invariant } from '../utils';
import { ModuleId } from '../module-id';

export type ContainerCacheEntry = {
  // requestId:string;
  value: any;
};

export class ContainerCache {
  public requestScope: Record<string, ContainerCacheEntry> = {};
  public initializedModules: Record<string, any> = {};

  constructor(public globalScope: Record<string, ContainerCacheEntry> = {}) {}

  setForGlobalScope(uuid: string, instance: any) {
    this.globalScope[uuid] = {
      value: instance,
    };
  }

  setForRequestScope(uuid: string, instance: any) {
    this.globalScope[uuid] = {
      value: instance,
    };
  }

  hasInGlobalScope(uuid: string): boolean {
    return !!this.globalScope[uuid];
  }

  hasInRequestScope(uuid: string): boolean {
    return !!this.requestScope[uuid];
  }

  getFromRequestScope(uuid: string) {
    invariant(!!this.requestScope[uuid], `Dependency with given uuid doesn't exists in request scope`);
    return this.requestScope[uuid].value;
  }

  getFromGlobalScope(uuid: string) {
    invariant(!!this.globalScope[uuid], `Dependency with given uuid doesn't exists in global scope`);
    return this.globalScope[uuid].value;
  }

  forNewRequest(): ContainerCache {
    return new ContainerCache(this.globalScope);
  }

  isInitialized(moduleId: ModuleId): boolean {
    return !!this.initializedModules[moduleId.id];
  }

  markInitialized(moduleId: ModuleId) {
    this.initializedModules[moduleId.id] = true;
  }
}
