import type { Definition } from '../definitions/abstract/Definition.js';
import type { IContainer } from '../container/IContainer.js';
import { isPromise } from '../utils/IsPromise.js';

import { InstancesMap, isDisposable } from './InstancesMap.js';
import { InstancesFinalizer } from './InstancesFinalizer.js';

export interface IInstancesStoreRead {
  hasRootInstance(definitionId: symbol): boolean;
  hasScopedInstance(definitionId: symbol): boolean;
}

export class InstancesStore implements IInstancesStoreRead {
  static setFinalizer(finalizer: InstancesFinalizer) {
    InstancesStore._finalizer = finalizer;
  }

  static addDisposeErrorListener(listener: (error: unknown) => void) {
    InstancesStore._finalizer.on('onDisposeError', listener);

    return () => {
      InstancesStore._finalizer.off('onDisposeError', listener);
    };
  }

  private static _finalizer = InstancesFinalizer.create();

  static create(): InstancesStore {
    return new InstancesStore(InstancesMap.create(), InstancesMap.create(), [], [], null);
  }

  private readonly _root: InstancesStore;

  constructor(
    private _globalInstances: InstancesMap,
    private _scopeInstances: InstancesMap,

    private _globalDisposables: Disposable[],
    private _scopeDisposables: Disposable[],

    _root: InstancesStore | null,
  ) {
    this._root = _root ?? this;
  }

  childScope(): InstancesStore {
    const childInstances = new InstancesStore(
      this._globalInstances,
      InstancesMap.create(),
      this._globalDisposables,
      [],
      this._root,
    );

    // InstancesStore._finalizer.appendChildInstancesRegistry(this, childInstances);

    return childInstances;
  }

  upsertIntoScopeInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    if (this._scopeInstances.has(definition.id)) {
      return this._scopeInstances.get(definition.id) as TInstance;
    } else {
      const instance = definition.create(container, ...args);

      this._scopeInstances.set(definition.id, instance);

      if (isPromise(instance)) {
        void instance.then(instanceAwaited => {
          if (isDisposable(instanceAwaited)) {
            InstancesStore._finalizer.registerScope(this, this._scopeDisposables);
            this._scopeDisposables.push(instanceAwaited);
          }
        });
      }

      if (isDisposable(instance)) {
        InstancesStore._finalizer.registerScope(this, this._scopeDisposables);
        this._scopeDisposables.push(instance);
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

      if (isPromise(instance)) {
        void instance.then(instanceAwaited => {
          if (isDisposable(instanceAwaited)) {
            InstancesStore._finalizer.registerRoot(this._root, this._globalDisposables);
            this._globalDisposables.push(instanceAwaited);
          }
        });
      }

      if (isDisposable(instance)) {
        InstancesStore._finalizer.registerRoot(this._root, this._globalDisposables);
        this._globalDisposables.push(instance);
      }

      return instance;
    }
  }

  hasScopedInstance(definitionId: symbol): boolean {
    return this._scopeInstances.has(definitionId);
  }

  hasRootInstance(definitionId: symbol): boolean {
    return this._globalInstances.has(definitionId);
  }
}
