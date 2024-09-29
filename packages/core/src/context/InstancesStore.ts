import { HierarchicalStore } from './HierarchicalStore.js';
import { Definition } from '../definitions/abstract/Definition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

export class InstancesStore {
  static create(scopeOverrides: readonly Definition<any, LifeTime.singleton, []>[]): InstancesStore {
    const ownKeys = scopeOverrides.map(def => def.id);
    return new InstancesStore(new HierarchicalStore(ownKeys), new Map(), new Map());
  }

  /**
   * @param hierarchicalScope
   * @param currentScope
   * @param globalOverridesScope
   */
  constructor(
    private hierarchicalScope: HierarchicalStore,
    private currentScope: Map<symbol, any>,
    private globalOverridesScope: Map<symbol, any>,
  ) {}

  childScope(scopeOverrides: readonly Definition<any, LifeTime.singleton, []>[]): InstancesStore {
    const scopeOverridesDefinitionIds = scopeOverrides.map(def => def.id);

    return new InstancesStore(
      this.hierarchicalScope.checkoutChild(scopeOverridesDefinitionIds),
      new Map(),
      this.globalOverridesScope,
    );
  }

  hasInCurrentScope(id: symbol): boolean {
    return this.currentScope.has(id);
  }

  upsertIntoFrozenInstances<T>(uuid: symbol, build: () => T) {
    if (this.globalOverridesScope.has(uuid)) {
      return this.globalOverridesScope.get(uuid);
    } else {
      const instance = build();
      this.globalOverridesScope.set(uuid, instance);
      return instance;
    }
  }

  upsertIntoScopeInstances<T>(uuid: symbol, build: () => T) {
    if (this.currentScope.has(uuid)) {
      return this.currentScope.get(uuid);
    } else {
      const instance = build();
      this.currentScope.set(uuid, instance);
      return instance;
    }
  }

  upsertIntoCascadingInstances<T>(uuid: symbol, build: () => T) {
    if (this.hierarchicalScope.has(uuid)) {
      return this.hierarchicalScope.get(uuid);
    } else {
      const instance = build();
      this.hierarchicalScope.set(uuid, instance);
      return instance;
    }
  }
}
