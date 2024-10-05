import { Definition } from '../definitions/abstract/Definition.js';
import { IContainer } from '../container/IContainer.js';
import { InstancesMap } from './InstancesMap.js';

export class InstancesStore {
  static create(): InstancesStore {
    return new InstancesStore(InstancesMap.create(), InstancesMap.create(), InstancesMap.create());
  }

  /**
   * @param _globalScope
   * @param _currentScope
   * @param _frozenDefinitions
   */
  constructor(
    private _globalScope: InstancesMap,
    private _currentScope: InstancesMap,
    private _frozenDefinitions: InstancesMap,
  ) {}

  childScope(): InstancesStore {
    return new InstancesStore(this._globalScope, InstancesMap.create(), this._frozenDefinitions);
  }

  upsertIntoFrozenInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    return this._frozenDefinitions.upsert(definition, container, ...args);
  }

  upsertIntoScopeInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    return this._currentScope.upsert(definition, container, ...args);
  }

  upsertIntoGlobalInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    return this._globalScope.upsert(definition, container, ...args);
  }
}
