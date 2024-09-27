export class InstancesStore {
  static create(): InstancesStore {
    return new InstancesStore(new Map(), new Map(), new Map());
  }

  /**
   * @param globalScope
   * @param currentScope
   * @param globalOverridesScope
   */
  constructor(
    private globalScope: Map<symbol, any>,
    private currentScope: Map<symbol, any>,
    private globalOverridesScope: Map<symbol, any>,
  ) {}

  childScope(): InstancesStore {
    return new InstancesStore(this.globalScope, new Map(), this.globalOverridesScope);
  }

  hasInCurrentScope(id: symbol): boolean {
    return this.currentScope.has(id);
  }

  upsertGlobalOverrideScope<T>(uuid: symbol, build: () => T) {
    if (this.globalOverridesScope.has(uuid)) {
      return this.globalOverridesScope.get(uuid);
    } else {
      const instance = build();
      this.globalOverridesScope.set(uuid, instance);
      return instance;
    }
  }

  upsertCurrentScope<T>(uuid: symbol, build: () => T) {
    if (this.currentScope.has(uuid)) {
      return this.currentScope.get(uuid);
    } else {
      const instance = build();
      this.currentScope.set(uuid, instance);
      return instance;
    }
  }

  upsertGlobalScope<T>(uuid: symbol, build: () => T) {
    if (this.globalScope.has(uuid)) {
      return this.globalScope.get(uuid);
    } else {
      const instance = build();
      this.globalScope.set(uuid, instance);
      return instance;
    }
  }
}
