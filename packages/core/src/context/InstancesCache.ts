import { SingletonScope } from './SingletonScope';
import invariant from 'tiny-invariant';
import { InstanceDefinition } from '../strategies/abstract/InstanceDefinition';

function getPatchedResolversIds(patchedDefinitions: InstanceDefinition<any, any>[]): string[] {
  return patchedDefinitions.map(def => def.id);
}

export class InstancesCache {
  static create(scopeOverrides: InstanceDefinition<any, any>[]): InstancesCache {
    const ownKeys = getPatchedResolversIds(scopeOverrides);
    return new InstancesCache(new SingletonScope(ownKeys), {}, {}, {});
  }

  constructor(
    private globalScope: SingletonScope,
    private currentScope: Record<string, any>,
    private requestScope: Record<string, any>,
    private globalOverridesScope: Record<string, any>,
  ) {}

  childScope(scopeOverrides: InstanceDefinition<any, any>[]): InstancesCache {
    const scopeOverridesResolversIds = getPatchedResolversIds(scopeOverrides);

    return new InstancesCache(
      this.globalScope.checkoutChild(scopeOverridesResolversIds),
      {},
      {},
      this.globalOverridesScope,
    );
  }

  checkoutForRequestScope(): InstancesCache {
    return new InstancesCache(this.globalScope, this.currentScope, {}, this.globalOverridesScope);
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

  private setForGlobalScope(uuid: string, instance: any) {
    this.globalScope.set(uuid, instance);
  }

  upsertGlobalOverrideScope<T>(uuid: string, build: () => T) {
    if (this.hasInGlobalOverride(uuid)) {
      return this.getFromGlobalOverride(uuid);
    } else {
      const instance = build();
      this.setForGlobalOverrideScope(uuid, instance);
      return instance;
    }
  }

  upsertGlobalScope<T>(uuid: string, build: () => T) {
    if (this.hasInGlobalScope(uuid)) {
      return this.getFromGlobalScope(uuid);
    } else {
      const instance = build();
      this.setForGlobalScope(uuid, instance);
      return instance;
    }
  }
}
