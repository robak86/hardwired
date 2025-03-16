import type { Definition } from '../definitions/impl/Definition.js';
import type { IContainer } from '../container/IContainer.js';
import { isPromise } from '../utils/IsPromise.js';
import type { CompositeDisposable } from '../container/CompositeDisposable.js';

import { InstancesMap, isDisposable } from './InstancesMap.js';

export interface IInstancesStoreRead {
  hasRootInstance(definitionId: symbol): boolean;
  hasScopedInstance(definitionId: symbol): boolean;
}

export class InstancesStore implements IInstancesStoreRead {
  // static setFinalizer(finalizer: DisposablesFinalizer) {
  //   InstancesStore._finalizer = finalizer;
  // }

  // static addDisposeErrorListener(listener: (error: unknown) => void) {
  //   InstancesStore._finalizer.on('onDisposeError', listener);
  //
  //   return () => {
  //     InstancesStore._finalizer.off('onDisposeError', listener);
  //   };
  // }

  // private static _finalizer = DisposablesFinalizer.create();

  static create(rootDisposer: CompositeDisposable, ownDisposer: CompositeDisposable): InstancesStore {
    return new InstancesStore(InstancesMap.create(), InstancesMap.create(), rootDisposer, ownDisposer);
  }

  constructor(
    private _globalInstances: InstancesMap,
    private _scopeInstances: InstancesMap,

    private _rootDisposer: CompositeDisposable,
    private _currentDisposer: CompositeDisposable,
  ) {}

  childScope(ownDisposer: CompositeDisposable): InstancesStore {
    return new InstancesStore(this._globalInstances, InstancesMap.create(), this._rootDisposer, ownDisposer);
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
    ...args: TArgs
  ) {
    if (this._scopeInstances.has(definition.id)) {
      return this._scopeInstances.get(definition.id) as TInstance;
    } else {
      const instance = definition.create(container, ...args);

      this._scopeInstances.set(definition.id, instance);

      this.registerDisposable(instance, this._currentDisposer);

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

  has(definitionId: symbol): boolean {
    return this.hasRootInstance(definitionId) || this.hasScopedInstance(definitionId);
  }

  get(definitionId: symbol): unknown {
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
