import { SingletonScope } from '../container/SingletonScope';
import { createContainerId } from '../utils/fastId';
import invariant from 'tiny-invariant';
import { InstanceEntry } from "../new/InstanceEntry";

function getPatchedResolversIds(loadTarget: InstanceEntry<any>[]):string[] {
  throw new Error("Implement me!")
  // return loadTarget.flatMap(m => {
  //   return m.patchedResolvers.values.map(patchedResolver => {
  //     return patchedResolver.id;
  //   });
  // });
}

export class InstancesCache {
  static create(scopeOverrides: InstanceEntry<any>[]): InstancesCache {
    const ownKeys = getPatchedResolversIds(scopeOverrides);
    return new InstancesCache(createContainerId(), new SingletonScope(ownKeys), {}, {}, {});
  }

  constructor(
    private id: string,
    private globalScope: SingletonScope,
    private currentScope: Record<string, any>,
    private requestScope: Record<string, any>,
    private globalOverridesScope: Record<string, any>,
  ) {}

  childScope(scopeOverrides: InstanceEntry<any>[]): InstancesCache {
    const scopeOverridesResolversIds = getPatchedResolversIds(scopeOverrides);

    return new InstancesCache(
      createContainerId(),
      this.globalScope.checkoutChild(scopeOverridesResolversIds),
      {},
      {},
      this.globalOverridesScope,
    );
  }

  checkoutForRequestScope(): InstancesCache {
    return new InstancesCache(createContainerId(), this.globalScope, this.currentScope, {}, this.globalOverridesScope);
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
}
