import { Definition } from '../definitions/abstract/Definition.js';
import { IContainer } from '../container/IContainer.js';
import { InstancesMap } from './InstancesMap.js';

export interface IInstancesStoreRead {
  hasSingleton(definitionId: symbol): boolean;
  hasScoped(definitionId: symbol): boolean;
  hasFrozen(definitionId: symbol): boolean;
}

export class InstancesStore implements IInstancesStoreRead {
  static create(): InstancesStore {
    return new InstancesStore(InstancesMap.create(), InstancesMap.create(), InstancesMap.create());
  }

  /**
   * @param _globalInstances
   * @param _scopeInstances
   * @param _frozenInstances
   */
  constructor(
    private _globalInstances: InstancesMap,
    private _scopeInstances: InstancesMap,
    private _frozenInstances: InstancesMap,
  ) {}

  childScope(): InstancesStore {
    return new InstancesStore(this._globalInstances, InstancesMap.create(), this._frozenInstances);
  }

  upsertIntoFrozenInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    return this._frozenInstances.upsert(definition, container, ...args);
  }

  upsertIntoScopeInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    return this._scopeInstances.upsert(definition, container, ...args);
  }

  upsertIntoGlobalInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    return this._globalInstances.upsert(definition, container, ...args);
  }

  hasFrozen(definitionId: symbol): boolean {
    return this._frozenInstances.has(definitionId);
  }

  hasScoped(definitionId: symbol): boolean {
    return this._scopeInstances.has(definitionId);
  }

  hasSingleton(definitionId: symbol): boolean {
    return this._globalInstances.has(definitionId);
  }
}
