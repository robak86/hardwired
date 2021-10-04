import { SingletonScope } from './SingletonScope';
import invariant from 'tiny-invariant';
import { ControlledPromise } from '../utils/ControlledPromise';
import { AsyncInstanceDefinition } from "../strategies/abstract/AsyncInstanceDefinition";

function getPatchedResolversIds(patchedDefinitions: AsyncInstanceDefinition<any, any>[]): string[] {
  return patchedDefinitions.map(def => def.id);
}

export class AsyncInstancesCache {
  static create(scopeOverrides: AsyncInstanceDefinition<any, any>[]): AsyncInstancesCache {
    const ownKeys = getPatchedResolversIds(scopeOverrides);
    return new AsyncInstancesCache(new SingletonScope(ownKeys), {}, {}, {});
  }

  constructor(
    private globalScope: SingletonScope,
    private currentScope: Record<string, Promise<any>>,
    private requestScope: Record<string, Promise<any>>,
    private globalOverridesScope: Record<string, Promise<any>>,
  ) {}

  childScope(scopeOverrides: AsyncInstanceDefinition<any, any>[]): AsyncInstancesCache {
    const scopeOverridesResolversIds = getPatchedResolversIds(scopeOverrides);

    return new AsyncInstancesCache(
      this.globalScope.checkoutChild(scopeOverridesResolversIds),
      {},
      {},
      this.globalOverridesScope,
    );
  }

  checkoutForRequestScope(): AsyncInstancesCache {
    return new AsyncInstancesCache(this.globalScope, this.currentScope, {}, this.globalOverridesScope);
  }

  hasInCurrentScope(id: string) {
    return !!this.currentScope[id];
  }

  getFromCurrentScope(id: string) {
    return this.currentScope[id];
  }

  hasInGlobalOverride(id: string) {
    return !!this.globalOverridesScope[id];
  }

  getFromGlobalOverride(id: string) {
    return this.globalOverridesScope[id];
  }

  setForGlobalOverrideScope(uuid: string, instance: any): void {
    this.globalOverridesScope[uuid] = instance;
  }

  hasInRequestScope(uuid: string): boolean {
    return !!this.requestScope[uuid];
  }

  hasInGlobalScope(uuid: string): boolean {
    return this.globalScope.has(uuid);
  }

  getFromRequestScope(uuid: string) {
    invariant(!!this.requestScope[uuid], `Dependency with given uuid doesn't exists in request scope`);
    return this.requestScope[uuid];
  }

  getFromGlobalScope(uuid: string) {
    invariant(!!this.globalScope.has(uuid), `Dependency with given uuid doesn't exists in global scope`);
    return this.globalScope.get(uuid);
  }

  setForRequestScope(uuid: string, instance: any): void {
    this.requestScope[uuid] = instance;
  }

  setForHierarchicalScope(id: string, instanceOrStrategy: any) {
    this.currentScope[id] = instanceOrStrategy;
  }

  setForGlobalScope(uuid: string, instance: any) {
    this.globalScope.set(uuid, instance);
  }

  async upsertGlobalScope<T>(uuid: string, build: () => Promise<T>) {
    if (this.hasInGlobalScope(uuid)) {
      return this.getFromGlobalScope(uuid);
    } else {
      const controlledPromise = new ControlledPromise<T>();
      this.setForGlobalScope(uuid, controlledPromise);
      const instance = await build();
      controlledPromise.resolve(instance);
      return instance;
    }
  }

  async upsertGlobalOverrideScope<T>(uuid: string, build: () => Promise<T>) {
    if (this.hasInGlobalOverride(uuid)) {
      return this.getFromGlobalOverride(uuid);
    } else {
      const controlledPromise = new ControlledPromise<T>();
      this.setForGlobalOverrideScope(uuid, controlledPromise);
      const instance = await build();
      controlledPromise.resolve(instance);
      return instance;
    }
  }
}
