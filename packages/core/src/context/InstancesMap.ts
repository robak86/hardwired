import { Definition } from '../definitions/abstract/Definition.js';
import { IContainer } from '../container/IContainer.js';

/**
 * Copy-on-write map. When a map is cloned, the new map references the same inner map as the original map.
 * When a value is set on the new map, the new map clones the original inner map and sets the value on the new map.
 */
export abstract class COWMap<V> {
  static create<V>(): COWMap<V> {
    return new InstancesMap(new Map(), true);
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

  abstract clone(): COWMap<V>;
}

export class InstancesMap extends COWMap<any> {
  static create(): InstancesMap {
    return new InstancesMap(new Map(), true);
  }

  upsert<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, any, TArgs>,
    container: IContainer,
    ...args: TArgs
  ) {
    if (this.has(definition.id)) {
      return this.get(definition.id);
    } else {
      const instance = definition.create(container, ...args);
      this.set(definition.id, instance);
      return instance;
    }
  }

  clone(): InstancesMap {
    return new InstancesMap(this._instances, false);
  }
}
