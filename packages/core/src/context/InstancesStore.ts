import { HierarchicalStore } from './HierarchicalStore';
import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';

function getPatchedResolversIds(patchedDefinitions: InstanceDefinition<any, any>[]): string[] {
  return patchedDefinitions.map(def => def.id);
}

export class InstancesStore {
  static create(scopeOverrides: InstanceDefinition<any, any>[]): InstancesStore {
    const ownKeys = getPatchedResolversIds(scopeOverrides);
    return new InstancesStore(new HierarchicalStore(ownKeys), {}, {}, {});
  }

  constructor(
    private hierarchicalScope: HierarchicalStore,
    private currentScope: Record<string, any>,
    private requestScope: Record<string, any>,
    private globalOverridesScope: Record<string, any>,
  ) {}

  childScope(scopeOverrides: InstanceDefinition<any, any>[]): InstancesStore {
    const scopeOverridesResolversIds = getPatchedResolversIds(scopeOverrides);

    return new InstancesStore(
      this.hierarchicalScope.checkoutChild(scopeOverridesResolversIds),
      {},
      {},
      this.globalOverridesScope,
    );
  }

  checkoutForRequestScope(): InstancesStore {
    return new InstancesStore(this.hierarchicalScope, this.currentScope, {}, this.globalOverridesScope);
  }

  upsertRequestScope<T>(uuid: string, build: () => T) {
    if (!!this.requestScope[uuid]) {
      return this.requestScope[uuid];
    } else {
      const instance = build();
      this.requestScope[uuid] = instance;
      return instance;
    }
  }

  upsertGlobalOverrideScope<T>(uuid: string, build: () => T) {
    if (!!this.globalOverridesScope[uuid]) {
      return this.globalOverridesScope[uuid];
    } else {
      const instance = build();
      this.globalOverridesScope[uuid] = instance;
      return instance;
    }
  }

  upsertCurrentScope<T>(uuid: string, build: () => T) {
    if (!!this.currentScope[uuid]) {
      return this.currentScope[uuid];
    } else {
      const instance = build();
      this.currentScope[uuid] = instance;
      return instance;
    }
  }

  upsertGlobalScope<T>(uuid: string, build: () => T) {
    if (this.hierarchicalScope.has(uuid)) {
      return this.hierarchicalScope.get(uuid);
    } else {
      const instance = build();
      this.hierarchicalScope.set(uuid, instance);
      return instance;
    }
  }
}
