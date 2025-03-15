import { v4 } from 'uuid';

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
    return new InstancesStore(InstancesMap.create(), InstancesMap.create(), null);
  }

  private readonly _root: InstancesStore;
  readonly id = v4();

  constructor(
    private _globalInstances: InstancesMap,
    private _scopeInstances: InstancesMap,

    _root: InstancesStore | null,
  ) {
    this._root = _root ?? this;
  }

  childScope(): InstancesStore {
    return new InstancesStore(this._globalInstances, InstancesMap.create(), this._root);
  }

  upsertIntoTransientInstances<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    const instance = definition.create(container, ...args);

    this.registerScopeDisposable(instance);

    return instance;
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

      this.registerScopeDisposable(instance);

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

      this.registerRootDisposable(instance);

      return instance;
    }
  }

  hasScopedInstance(definitionId: symbol): boolean {
    return this._scopeInstances.has(definitionId);
  }

  hasRootInstance(definitionId: symbol): boolean {
    return this._globalInstances.has(definitionId);
  }

  private registerScopeDisposable(instance: unknown) {
    if (isPromise(instance)) {
      void instance.then(instanceAwaited => {
        if (isDisposable(instanceAwaited)) {
          InstancesStore._finalizer.registerScope(this, instanceAwaited);
        }
      });
    }

    if (isDisposable(instance)) {
      InstancesStore._finalizer.registerScope(this, instance);
    }
  }

  private registerRootDisposable(instance: unknown) {
    if (isPromise(instance)) {
      void instance.then(instanceAwaited => {
        if (isDisposable(instanceAwaited)) {
          InstancesStore._finalizer.registerRoot(this._root, instanceAwaited);
        }
      });
    }

    if (isDisposable(instance)) {
      InstancesStore._finalizer.registerRoot(this._root, instance);
    }
  }
}
