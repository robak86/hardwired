import type { Definition } from '../definitions/abstract/Definition.js';
import type { IContainer } from '../container/IContainer.js';
import { isPromise } from '../utils/IsPromise.js';

function isDisposable(obj: any): obj is Disposable {
  return typeof obj?.[Symbol.dispose] === 'function';
}

/**
 * Copy-on-write map. When a map is cloned, the new map references the same inner map as the original map.
 * When a value is set on the new map, the new map clones the original inner map and sets the value on the new map.
 */
export class COWMap<V> {
  static create<V>(): COWMap<V> {
    return new COWMap<V>(new Map(), true);
  }

  protected constructor(
    protected _instances: Map<symbol, V>,
    protected _pristine: boolean,
  ) {}

  has(definitionId: symbol): boolean {
    return this._instances.has(definitionId);
  }

  set(definitionId: symbol, instance: V): void {
    if (!this._pristine) {
      this._instances = new Map(this._instances);
      this._pristine = true;
    }

    this._instances.set(definitionId, instance);
  }

  get(definitionId: symbol): V | undefined {
    return this._instances.get(definitionId);
  }

  clone(): COWMap<V> {
    return new COWMap(this._instances, false);
  }
}

export class InstancesMap extends Map<symbol, any> {
  private _disposables: Disposable[] = [];

  static create(): InstancesMap {
    return new InstancesMap();
  }

  get disposables() {
    return this._disposables;
  }

  upsert<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ): TInstance {
    if (this.has(definition.id)) {
      return this.get(definition.id) as TInstance;
    } else {
      const instance = definition.create(container, ...args);

      this.set(definition.id, instance);

      if (isPromise(instance)) {
        void instance.then(instanceAwaited => {
          if (isDisposable(instanceAwaited)) {
            this._disposables.push(instanceAwaited);
          }
        });
      }

      if (isDisposable(instance)) {
        this._disposables.push(instance as Disposable);
      }

      return instance;
    }
  }
}
