export class InstancesStore {
  static create(): InstancesStore {
    return new InstancesStore({}, {}, {});
  }

  /**
   * @param globalScope
   * @param currentScope
   * @param globalOverridesScope
   */
  constructor(
    private globalScope: Record<string, any>,
    private currentScope: Record<string, any>,
    private globalOverridesScope: Record<string, any>,
  ) {}

  childScope(): InstancesStore {
    return new InstancesStore(this.globalScope, {}, this.globalOverridesScope);
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
    if (this.globalScope[uuid]) {
      return this.globalScope[uuid];
    } else {
      const instance = build();
      this.globalScope[uuid] = instance;
      return instance;
    }
  }
}
