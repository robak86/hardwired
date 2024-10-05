import { Definition } from '../definitions/abstract/Definition.js';
import { IContainer } from '../container/IContainer.js';

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

  upsertIntoFrozenInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    if (this._globalOverridesScope.has(definition.id)) {
      return this._globalOverridesScope.get(definition.id);
    } else {
      const instance = definition.create(container, ...args);
      this._globalOverridesScope.set(definition.id, instance);
      return instance;
    }
  }

  upsertIntoScopeInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    if (this._currentScope.has(definition.id)) {
      return this._currentScope.get(definition.id);
    } else {
      const instance = definition.create(container, ...args);
      this._currentScope.set(definition.id, instance);
      return instance;
    }
  }

  upsertIntoGlobalInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    if (this._globalScope.has(definition.id)) {
      return this._globalScope.get(definition.id);
    } else {
      const instance = definition.create(container, ...args);
      this._globalScope.set(definition.id, instance);
      return instance;
    }
  }
}
