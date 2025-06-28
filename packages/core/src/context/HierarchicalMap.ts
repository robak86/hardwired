export class HierarchicalMap<V> {
  private _own = new Map<symbol, V>();

  constructor(private readonly _parent?: HierarchicalMap<V>) {}

  static create<V>(): HierarchicalMap<V> {
    return new HierarchicalMap();
  }

  set(key: symbol, value: V): void {
    this._own.set(key, value);
  }

  get(key: symbol): V | undefined {
    if (this._own.has(key)) return this._own.get(key);

    return this._parent?.get(key);
  }

  has(key: symbol): boolean {
    return this._own.has(key) || this._parent?.has(key) || false;
  }

  hasOwn(key: symbol): boolean {
    return this._own.has(key);
  }

  hasInherited(key: symbol): boolean {
    return (!this._own.has(key) && this._parent?.has(key)) || false;
  }

  forEach(callback: (value: V, key: symbol) => void): void {
    const seen = new Set<symbol>();

    // Visit own entries first — own values override inherited ones
    this._own.forEach((value, key) => {
      seen.add(key);
      callback(value, key);
    });

    this._parent?.forEach((value, key) => {
      if (!seen.has(key)) {
        seen.add(key);
        callback(value, key);
      }
    });
  }

  child(): HierarchicalMap<V> {
    return new HierarchicalMap(this);
  }
}
