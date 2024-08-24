import { HierarchicalStore } from './HierarchicalStore.js';
import { Overrides } from '../container/Assignments.js';

export class InstancesStore {
  static create(scopeOverrides: Overrides): InstancesStore {
    const ownKeys = scopeOverrides.map(def => def.id);
    return new InstancesStore(new HierarchicalStore(ownKeys), {}, {});
  }

  /**
   * @param hierarchicalScope
   * @param currentScope
   * @param globalOverridesScope
   */
  constructor(
    private hierarchicalScope: HierarchicalStore,
    private currentScope: Record<string, any>,
    private globalOverridesScope: Record<string, any>,
  ) {}

  childScope(scopeOverrides: Overrides): InstancesStore {
    const scopeOverridesDefinitionIds = scopeOverrides.map(def => def.id);

    return new InstancesStore(
      this.hierarchicalScope.checkoutChild(scopeOverridesDefinitionIds),
      {},
      this.globalOverridesScope,
    );
  }

  hasInCurrentScope(id: string): boolean {
    return this.currentScope[id];
  }

  upsertGlobalOverrideScope<T>(uuid: string, build: () => T) {
    if (this.globalOverridesScope[uuid]) {
      return this.globalOverridesScope[uuid];
    } else {
      const instance = build();
      this.globalOverridesScope[uuid] = instance;
      return instance;
    }
  }

  upsertCurrentScope<T>(uuid: string, build: () => T) {
    if (this.currentScope[uuid]) {
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
