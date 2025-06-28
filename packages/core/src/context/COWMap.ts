export function isDisposable(obj: any): obj is Disposable {
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

  private _inheritedKeys?: Set<symbol>;

  protected constructor(
    protected _entries: Map<symbol, V>,
    protected _pristine: boolean,
  ) {}

  has(definitionId: symbol): boolean {
    return this._entries.has(definitionId);
  }

  /**
   * Checks if the map has an entry that is not inherited from a cloned map.
   * @param definitionId
   */
  hasOwn(definitionId: symbol): boolean {
    if (this._pristine) {
      return false;
    }

    return this._entries.has(definitionId) && !this._inheritedKeys?.has(definitionId);
  }

  hasInherited(definitionId: symbol): boolean {
    return this.has(definitionId) && !this.hasOwn(definitionId);
  }

  set(definitionId: symbol, instance: V): void {
    if (this._pristine) {
      this._entries = new Map(this._entries);
      this._inheritedKeys = new Set(this._entries.keys()); // implemented here instead of constructor, to make it lazy
      this._pristine = false;
    }

    this._inheritedKeys!.delete(definitionId);
    this._entries.set(definitionId, instance);
  }

  get(definitionId: symbol): V | undefined {
    return this._entries.get(definitionId);
  }

  clone(): COWMap<V> {
    return new COWMap(this._entries, true);
  }

  forEach(callback: (value: V, key: symbol) => void): void {
    this._entries.forEach(callback);
  }
}
