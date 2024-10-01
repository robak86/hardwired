export class InstancesStore {
  static create(): InstancesStore {
    return new InstancesStore(new Map(), new Map(), new Map());
  }

  /**
   * @param _globalScope
   * @param _currentScope
   * @param _globalOverridesScope
   */
  constructor(
    private _globalScope: Map<symbol, any>,
    private _currentScope: Map<symbol, any>,
    private _globalOverridesScope: Map<symbol, any>,
  ) {}

  childScope(): InstancesStore {
    return new InstancesStore(this._globalScope, new Map(), this._globalOverridesScope);
  }

  hasInCurrentScope(id: symbol): boolean {
    return this._currentScope.has(id);
  }

  hasInGlobalScope(id: symbol): boolean {
    return this._globalScope.has(id);
  }

  hasInGlobalOverridesScope(id: symbol): boolean {
    return this._globalOverridesScope.has(id);
  }

  upsertIntoFrozenInstances<T>(uuid: symbol, build: () => T) {
    if (this._globalOverridesScope.has(uuid)) {
      return this._globalOverridesScope.get(uuid);
    } else {
      const instance = build();
      this._globalOverridesScope.set(uuid, instance);
      return instance;
    }
  }

  upsertIntoScopeInstances<T>(uuid: symbol, build: () => T) {
    if (this._currentScope.has(uuid)) {
      return this._currentScope.get(uuid);
    } else {
      const instance = build();
      this._currentScope.set(uuid, instance);
      return instance;
    }
  }

  upsertIntoGlobalInstances<T>(uuid: symbol, build: () => T) {
    if (this._globalScope.has(uuid)) {
      return this._globalScope.get(uuid);
    } else {
      const instance = build();
      this._globalScope.set(uuid, instance);
      return instance;
    }
  }
}
