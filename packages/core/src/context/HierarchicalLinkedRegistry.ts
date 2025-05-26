interface IMapLike<K, V> {
  has(key: K): boolean;
  get(key: K): V | undefined;
  set(key: K, value: V): this;
}

export class HierarchicalLinkedRegistry<K, V> {
  static create<K, V>(entriesFactory: () => IMapLike<K, Array<V>>): HierarchicalLinkedRegistry<K, V> {
    return new HierarchicalLinkedRegistry<K, V>(entriesFactory, entriesFactory(), entriesFactory());
  }

  protected constructor(
    private _entriesFactory: () => IMapLike<K, Array<V>>,
    private _definitions: IMapLike<K, Array<V>>,
    private _overrides: IMapLike<K, Array<V>>,
    private _parent?: HierarchicalLinkedRegistry<K, V>,
    private _prev?: HierarchicalLinkedRegistry<K, V>,
  ) {}

  hasOwn(id: K): boolean {
    return this._definitions.has(id) || this._overrides.has(id) || Boolean(this._prev?.hasOwn(id));
  }

  has(id: K): boolean {
    return this.hasOwn(id) || this._parent?.has(id) || false;
  }

  getOverride(id: K): Array<V> {
    return this._overrides.get(id) ?? this._prev?.getOverride(id) ?? this._parent?.getOverride(id) ?? [];
  }

  getDefinition(id: K): Array<V> {
    return this._definitions.get(id) ?? this._prev?.getDefinition(id) ?? this._parent?.getDefinition(id) ?? [];
  }

  get(id: K): Array<V> {
    return this.getOverride(id) ?? this.getDefinition(id) ?? this._parent?.get(id) ?? [];
  }

  checkoutScope(other: Array<this>) {
    return new HierarchicalLinkedRegistry(this._entriesFactory, this._entriesFactory(), this._entriesFactory())
      .appendPrevious(other)
      .withParent(this);
  }

  private withParent(parent: HierarchicalLinkedRegistry<K, V>): HierarchicalLinkedRegistry<K, V> {
    if (this._parent) {
      throw new Error(
        `HierarchicalRegistry is already linked to some parent. You most likely don't wanna continue with this.`,
      );
    }

    return new HierarchicalLinkedRegistry(this._entriesFactory, this._definitions, this._overrides, parent, this._prev);
  }

  private withPrev(prev: HierarchicalLinkedRegistry<K, V>): HierarchicalLinkedRegistry<K, V> {
    if (this._prev) {
      throw new Error(
        `HierarchicalRegistry is already linked to some previous registry. You most likely don't wanna continue with this.`,
      );
    }

    return new HierarchicalLinkedRegistry(this._entriesFactory, this._definitions, this._overrides, this._parent, prev);
  }

  private appendPrevious(others: Array<HierarchicalLinkedRegistry<K, V>>) {
    if (others.length === 0) {
      return new HierarchicalLinkedRegistry(
        this._entriesFactory,
        this._definitions,
        this._overrides,
        this._parent,
        this._prev,
      );
    }

    const next = others.reduce((parentRegistry, registry) => registry.withPrev(parentRegistry), this);

    if (this._prev) {
      return new HierarchicalLinkedRegistry(this._entriesFactory, this._definitions, this._overrides, next, this._prev);
    }

    return new HierarchicalLinkedRegistry(this._entriesFactory, this._definitions, this._overrides, next);
  }
}
