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
  readonly id = crypto.randomUUID();

  static create(): InstancesStore {
    return new InstancesStore(InstancesMap.create(), InstancesMap.create(), InstancesFinalizer.create());
  }

  constructor(
    private _globalInstances: InstancesMap,
    private _scopeInstances: InstancesMap,
    private _instancesFinalizer: InstancesFinalizer,
  ) {}

  get rootDisposables() {
    return this._globalInstances.disposables;
  }

  get scopeDisposables() {
    return this._scopeInstances.disposables;
  }

  childScope(): InstancesStore {
    return new InstancesStore(this._globalInstances, InstancesMap.create(), this._instancesFinalizer.scope());
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
            this._instancesFinalizer.registerScope(this);
            this._instancesFinalizer.appendScopeDisposable(this.id, instanceAwaited);

            console.log('Appending scope disposable', definition.name);
          }
        });
      }

      if (isDisposable(instance)) {
        this._instancesFinalizer.registerScope(this);
        this._instancesFinalizer.appendScopeDisposable(this.id, instance);
        console.log('Appending scope disposable', definition.name);
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
            this._instancesFinalizer.registerRoot(this);
            this._instancesFinalizer.appendRootDisposable(instanceAwaited);
            console.log('Appending root disposable', definition.name);
          }
        });
      }

      if (isDisposable(instance)) {
        this._instancesFinalizer.registerRoot(this);
        this._instancesFinalizer.appendRootDisposable(instance);
        console.log('Appending root disposable', definition.name);
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
