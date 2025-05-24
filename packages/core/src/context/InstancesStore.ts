import { isThenable } from '../utils/IsThenable.js';
import { CompositeDisposable } from '../disposable/CompositeDisposable.js';
import type { IDefinitionToken } from '../definitions/def-symbol.js';
import { MaybeAsync } from '../utils/MaybeAsync.js';

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
      new Map<symbol, MaybeAsync<unknown>>(),
      new Map<symbol, MaybeAsync<unknown>>(),
      new CompositeDisposable(),
      new CompositeDisposable(),
    );
  }

  private constructor(
    private _parent: InstancesStore | null,
    private _globalInstances: Map<symbol, MaybeAsync<unknown>>,
    private _scopeInstances: Map<symbol, MaybeAsync<unknown>>,
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

  getRootInstance(definitionId: symbol): MaybeAsync<unknown> | undefined {
    return this._globalInstances.get(definitionId);
  }

  setRootInstance(definitionId: symbol, instance: MaybeAsync<unknown>): void {
    this._globalInstances.set(definitionId, instance);
    this.registerDisposable(instance, this._rootDisposer);
  }

  hasScopedInstance(definitionId: symbol): boolean {
    return this._scopeInstances.has(definitionId);
  }

  getScopedInstance(definitionId: symbol): MaybeAsync<unknown> | undefined {
    return this._scopeInstances.get(definitionId);
  }

  setScopedInstance(definitionId: symbol, instance: MaybeAsync<unknown>): void {
    this._scopeInstances.set(definitionId, instance);

    this.registerDisposable(instance, this._currentDisposer);
  }

  hasRootInstance(definitionId: symbol): boolean {
    return this._globalInstances.has(definitionId);
  }

  has(symbol: IDefinitionToken<any, any>): boolean {
    return this._globalInstances.has(symbol.id) || this._scopeInstances.has(symbol.id);
  }

  hasInherited(symbol: IDefinitionToken<any, any>): boolean {
    return this._parent?.has(symbol) ?? this._parent?.hasInherited(symbol) ?? false;
  }

  getExisting<TInstance>(symbol: IDefinitionToken<TInstance, any>): MaybeAsync<TInstance | null> {
    return (
      (this._globalInstances.get(symbol.id) as MaybeAsync<TInstance>) ??
      (this._scopeInstances.get(symbol.id) as MaybeAsync<TInstance>) ??
      MaybeAsync.null
    );
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
