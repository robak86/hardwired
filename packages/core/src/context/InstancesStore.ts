import type { Definition } from '../definitions/impl/Definition.js';
import type { IContainer } from '../container/IContainer.js';
import { isPromise } from '../utils/IsPromise.js';
import { CompositeDisposable } from '../container/CompositeDisposable.js';

import { InstancesMap, isDisposable } from './InstancesMap.js';

export interface IInstancesStoreRead {
  hasRootInstance(definitionId: symbol): boolean;
  hasScopedInstance(definitionId: symbol): boolean;
}

export class InstancesStore implements IInstancesStoreRead {
  static create(): InstancesStore {
    return new InstancesStore(
      InstancesMap.create(),
      InstancesMap.create(),
      new CompositeDisposable(),
      new CompositeDisposable(),
    );
  }

  private constructor(
    private _globalInstances: InstancesMap,
    private _scopeInstances: InstancesMap,
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
    return new InstancesStore(
      this._globalInstances,
      InstancesMap.create(),
      this._rootDisposer,
      new CompositeDisposable(),
    );
  }

  upsertIntoTransientInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    const instance = definition.create(container, ...args);

    this.registerDisposable(instance, this._currentDisposer);

    return instance;
  }

  upsertIntoScopeInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    isCascadingInherited: boolean,
    ...args: TArgs
  ) {
    if (this._scopeInstances.has(definition.id)) {
      return this._scopeInstances.get(definition.id) as TInstance;
    } else {
      const instance = definition.create(container, ...args);

      // If the definition is bound to the current container then after calling definition.create
      // we already may have the instance in the store, hence we cannot register it for duplicated disposal.
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

  upsertIntoRootInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    if (this._globalInstances.has(definition.id)) {
      return this._globalInstances.get(definition.id) as TInstance;
    } else {
      const instance = definition.create(container, ...args);

      this._globalInstances.set(definition.id, instance);

      this.registerDisposable(instance, this._rootDisposer);

      return instance;
    }
  }

  hasScopedInstance(definitionId: symbol): boolean {
    return this._scopeInstances.has(definitionId);
  }

  hasRootInstance(definitionId: symbol): boolean {
    return this._globalInstances.has(definitionId);
  }

  getExisting(definitionId: symbol): unknown {
    return this._globalInstances.get(definitionId) ?? this._scopeInstances.get(definitionId);
  }

  private registerDisposable(instance: unknown, disposer: CompositeDisposable) {
    if (isPromise(instance)) {
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
