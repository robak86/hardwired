import type { Definition } from '../definitions/abstract/Definition.js';
import type { IContainer } from '../container/IContainer.js';

import { InstancesMap } from './InstancesMap.js';

export interface IInstancesStoreRead {
  hasRootInstance(definitionId: symbol): boolean;
  hasScopedInstance(definitionId: symbol): boolean;
}

export class InstancesStore implements IInstancesStoreRead {
  static create(): InstancesStore {
    return new InstancesStore(InstancesMap.create(), InstancesMap.create());
  }

  /**
   * @param _globalInstances
   * @param _scopeInstances
   */
  constructor(
    private _globalInstances: InstancesMap,
    private _scopeInstances: InstancesMap,
  ) {}

  get rootDisposables() {
    return this._globalInstances.disposables;
  }

  get scopeDisposables() {
    return this._scopeInstances.disposables;
  }

  childScope(): InstancesStore {
    return new InstancesStore(this._globalInstances, InstancesMap.create());
  }

  upsertIntoScopeInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    return this._scopeInstances.upsert(definition, container, ...args);
  }

  upsertIntoRootInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    return this._globalInstances.upsert(definition, container, ...args);
  }

  hasScopedInstance(definitionId: symbol): boolean {
    return this._scopeInstances.has(definitionId);
  }

  hasRootInstance(definitionId: symbol): boolean {
    return this._globalInstances.has(definitionId);
  }

  has(definitionId: symbol): boolean {
    return this.hasScopedInstance(definitionId) || this.hasRootInstance(definitionId);
  }

  get(definitionId: symbol): unknown {
    return this._globalInstances.get(definitionId) ?? this._scopeInstances.get(definitionId);
  }
}
