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

  static all<V>(maps: Array<COWMap<V>>): COWMap<V> {
    const mapEntries = maps.map(map => map._entries);

    const merged = new Map(mapEntries.flatMap(m => [...m]));

    return new COWMap<V>(merged, true);
  }

  private _inheritedKeys = new Set<symbol>();

  protected constructor(
    protected _entries: Map<symbol, V>,
    protected _pristine: boolean,
  ) {}

  has(definitionId: symbol): boolean {
    return this._entries.has(definitionId);
  }

  hasOwn(definitionId: symbol): boolean {
    return this._pristine && this._entries.has(definitionId) && !this._inheritedKeys.has(definitionId);
  }

  hasInherited(definitionId: symbol): boolean {
    return this.has(definitionId) && !this.hasOwn(definitionId);
  }

  set(definitionId: symbol, instance: V): void {
    if (!this._pristine) {
      this._inheritedKeys = new Set(this._entries.keys());
      this._entries = new Map(this._entries);
      this._pristine = true;
    }

    this._inheritedKeys.delete(definitionId);
    this._entries.set(definitionId, instance);
  }

  get(definitionId: symbol): V | undefined {
    return this._entries.get(definitionId);
  }

  clone(): COWMap<V> {
    return new COWMap(this._entries, false);
  }

  forEach(callback: (value: V, key: symbol) => void): void {
    this._entries.forEach(callback);
  }
}
