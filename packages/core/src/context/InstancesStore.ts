import { isThenable } from '../utils/IsThenable.js';
import { CompositeDisposable } from '../disposable/CompositeDisposable.js';
import type { IDefinitionSymbol } from '../definitions/def-symbol.js';

import { isDisposable } from './COWMap.js';

export interface IInstancesStoreRead {
  hasRootInstance(definitionId: symbol): boolean;
  hasScopedInstance(definitionId: symbol): boolean;
}

// TODO: reduce the number of public methods by accepting IDefinitionSymbol as a parameter
// That will allow hiding the implementation details related to lifetimes
export class InstancesStore implements IInstancesStoreRead {
  static create(): InstancesStore {
    return new InstancesStore(
      null,
      new Map<symbol, unknown>(),
      new Map<symbol, unknown>(),
      new CompositeDisposable(),
      new CompositeDisposable(),
    );
  }

  private constructor(
    private _parent: InstancesStore | null,
    private _globalInstances: Map<symbol, unknown>,
    private _scopeInstances: Map<symbol, unknown>,
    private _rootDisposer: CompositeDisposable,
    private _currentDisposer: CompositeDisposable,
  ) {}

  disposeRoot() {
    this._rootDisposer[Symbol.dispose]();
  }

  disposeCurrent() {
    this._currentDisposer[Symbol.dispose]();
  }

  childScope(): InstancesStore {
    return new InstancesStore(this, this._globalInstances, new Map(), this._rootDisposer, new CompositeDisposable());
  }

  getRootInstance(definitionId: symbol): unknown {
    return this._globalInstances.get(definitionId);
  }

  setRootInstance(definitionId: symbol, instance: unknown): void {
    this._globalInstances.set(definitionId, instance);
    this.registerDisposable(instance, this._rootDisposer);
  }

  hasScopedInstance(definitionId: symbol): boolean {
    return this._scopeInstances.has(definitionId);
  }

  getScopedInstance(definitionId: symbol): unknown {
    return this._scopeInstances.get(definitionId);
  }

  setScopedInstance(definitionId: symbol, instance: unknown): void {
    this._scopeInstances.set(definitionId, instance);

    this.registerDisposable(instance, this._currentDisposer);
  }

  hasRootInstance(definitionId: symbol): boolean {
    return this._globalInstances.has(definitionId);
  }

  has(symbol: IDefinitionSymbol<any, any>): boolean {
    return this._globalInstances.has(symbol.id) || this._scopeInstances.has(symbol.id);
  }

  hasInherited(symbol: IDefinitionSymbol<any, any>): boolean {
    return this._parent?.has(symbol) ?? this._parent?.hasInherited(symbol) ?? false;
  }

  getExisting(symbol: IDefinitionSymbol<any, any>): unknown {
    return this._globalInstances.get(symbol.id) ?? this._scopeInstances.get(symbol.id);
  }

  private registerDisposable(instance: unknown, disposer: CompositeDisposable) {
    if (isThenable(instance)) {
      void instance.then(instanceAwaited => {
        if (isDisposable(instanceAwaited)) {
          disposer.registerDisposable(instanceAwaited);
        }
      });
    }

    if (isDisposable(instance)) {
      disposer.registerDisposable(instance);
    }
  }
}
