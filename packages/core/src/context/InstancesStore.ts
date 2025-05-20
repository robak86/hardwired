import type { IContainer } from '../container/IContainer.js';
import { isThenable } from '../utils/IsThenable.js';
import { CompositeDisposable } from '../disposable/CompositeDisposable.js';
import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { IDefinitionSymbol } from '../definitions/def-symbol.js';

import { isDisposable } from './COWMap.js';

export interface IInstancesStoreRead {
  hasRootInstance(definitionId: symbol): boolean;
  hasScopedInstance(definitionId: symbol): boolean;
}

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

  upsertIntoScopeInstances<TInstance>(
    definition: IDefinition<TInstance, any>,
    container: IContainer,
    isCascadingInherited: boolean,
  ) {
    if (this._scopeInstances.has(definition.id)) {
      return this._scopeInstances.get(definition.id) as TInstance;
    } else {
      const instance = definition.create(container);

      // If the definition is bound to the current container then after calling definition.create
      // we already have the instance in the store, hence we should not register it for duplicated disposal.
      if (this._scopeInstances.has(definition.id)) {
        return this._scopeInstances.get(definition.id) as TInstance;
      }

      this._scopeInstances.set(definition.id, instance);

      if (!isCascadingInherited) {
        this.registerDisposable(instance, this._currentDisposer);
      }

      return instance;
    }
  }

  upsertIntoRootInstances<TInstance, TLifeTime extends LifeTime>(
    definition: IDefinition<TInstance, TLifeTime>,
    container: IContainer,
  ) {
    if (this._globalInstances.has(definition.id)) {
      return this._globalInstances.get(definition.id) as TInstance;
    } else {
      const instance = definition.create(container);

      this._globalInstances.set(definition.id, instance);

      this.registerDisposable(instance, this._rootDisposer);

      return instance;
    }
  }

  getTransientDefinition<TInstance>(
    symbol: IDefinitionSymbol<TInstance, LifeTime>,
  ): IDefinition<TInstance, LifeTime.transient> | undefined {
    // TODO: we probably need a separate store for transient definitions ? or maybe not
    return this._globalInstances.get(symbol.id) as IDefinition<TInstance, LifeTime.transient>;
  }

  hasScopedInstance(definitionId: symbol): boolean {
    return this._scopeInstances.has(definitionId);
  }

  hasRootInstance(definitionId: symbol): boolean {
    return this._globalInstances.has(definitionId);
  }

  has(definitionId: symbol): boolean {
    return this._globalInstances.has(definitionId) || this._scopeInstances.has(definitionId);
  }

  hasInherited(definitionId: symbol): boolean {
    return this._parent?.has(definitionId) ?? this._parent?.hasInherited(definitionId) ?? false;
  }

  getExisting(definitionId: symbol): unknown {
    return this._globalInstances.get(definitionId) ?? this._scopeInstances.get(definitionId);
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

  getSingletonDefinition<TInstance>(
    symbol: IDefinitionSymbol<TInstance, LifeTime>,
  ): IDefinition<TInstance, LifeTime.singleton> | undefined {
    return this._globalInstances.get(symbol.id) as IDefinition<TInstance, LifeTime.singleton>;
  }

  getScopedDefinition<TInstance>(
    symbol: IDefinitionSymbol<TInstance, LifeTime>,
  ): IDefinition<TInstance, LifeTime.scoped> | undefined {
    return this._globalInstances.get(symbol.id) as IDefinition<TInstance, LifeTime.scoped>;
  }
}
