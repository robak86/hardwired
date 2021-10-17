import { HierarchicalStore } from './HierarchicalStore';
import { InstanceDefinition } from '../definitions/abstract/InstanceDefinition';
import { AnyInstanceDefinition } from "../definitions/abstract/AnyInstanceDefinition";

export class InstancesStore {
  static create(scopeOverrides: AnyInstanceDefinition<any, any>[]): InstancesStore {
    const ownKeys = scopeOverrides.map(def => def.id);
    return new InstancesStore(new HierarchicalStore(ownKeys), {}, {}, {});
  }

  constructor(
    private hierarchicalScope: HierarchicalStore,
    private currentScope: Record<string, any>,
    private requestScope: Record<string, any>,
    private globalOverridesScope: Record<string, any>,
  ) {}

  childScope(scopeOverrides: AnyInstanceDefinition<any, any>[]): InstancesStore {
    const scopeOverridesResolversIds = scopeOverrides.map(def => def.id);

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
