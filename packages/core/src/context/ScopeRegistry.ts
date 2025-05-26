import { COWMap } from './COWMap.js';

export interface IReadonlyScopeRegistry<V> {
  findRegistration(definitionId: symbol): V | undefined;
  findOverride(definitionId: symbol): V | undefined;
  find(definitionId: symbol): V | undefined;
  get(definitionId: symbol): V;
  has(definitionId: symbol): boolean;
  getForOverride(definitionId: symbol): V;
  forEach(iterFn: (value: V) => void): void;
  checkoutScope(next: IReadonlyScopeRegistry<V>[]): ScopeRegistry<V>;
}

export class ScopeRegistry<V> implements IReadonlyScopeRegistry<V> {
  static empty<V>(): ScopeRegistry<V> {
    return new ScopeRegistry<V>(COWMap.create<V>(), null, null);
  }

  static root<V>(registries: Array<ScopeRegistry<V>>): ScopeRegistry<V> {
    return ScopeRegistry.empty<V>().checkoutScope(registries);
  }

  private _overrides = new Map<symbol, V>();
  private _isFrozen = false;

  constructor(
    protected _registrations: COWMap<V>,
    protected _parent: IReadonlyScopeRegistry<V> | null,
    protected _prev: IReadonlyScopeRegistry<V> | null,
  ) {}

  freeze(): this {
    if (this._isFrozen) {
      throw new Error('ScopeRegistry is already frozen.');
    }

    this._isFrozen = true;

    return this;
  }

  findRegistration(definitionId: symbol): V | undefined {
    return this._registrations.get(definitionId) ?? this._parent?.findRegistration(definitionId);
  }

  findOverride(definitionId: symbol): V | undefined {
    return this._overrides.get(definitionId) ?? this._parent?.findOverride(definitionId);
  }

  find(definitionId: symbol): V | undefined {
    return (
      this._overrides.get(definitionId) ??
      this._registrations.get(definitionId) ??
      this._prev?.find(definitionId) ??
      this._parent?.find(definitionId)
    );
  }

  get(definitionId: symbol): V {
    const definition = this._overrides.get(definitionId) ?? this.findRegistration(definitionId);

    if (!definition) {
      throw new Error(`No definition registered for ${definitionId.toString()}`);
    }

    return definition;
  }
  has(definitionId: symbol): boolean {
    return (
      this._overrides.has(definitionId) ||
      this._registrations.has(definitionId) ||
      Boolean(this._parent?.has(definitionId))
    );
  }

  getForOverride(definitionId: symbol): V {
    const def = this.findOverride(definitionId) || this.findRegistration(definitionId);
    // if (this._overrides.has(definitionId)) {

    if (!def) {
      throw new Error(`No definition registered for ${definitionId.toString()}.
     If you want to modify definition make sure it's registered first using .add(...) method.`);
    }

    return def;
  }

  forceRegister(definitionId: symbol, instance: V) {
    this.assertMutable(definitionId);

    this._registrations.set(definitionId, instance);
  }

  forceOverride(definitionId: symbol, instance: V) {
    this.assertMutable(definitionId);

    this._overrides.set(definitionId, instance);
  }

  append(definitionId: symbol, instance: V) {
    this.assertMutable(definitionId);

    const current = this._registrations.get(definitionId);

    if (current) {
      this._overrides.set(definitionId, instance);
    } else {
      this._registrations.set(definitionId, instance);
    }
  }

  register(definitionId: symbol, instance: V) {
    if (this._registrations.has(definitionId)) {
      throw new Error(`Instance with id ${definitionId.toString()} already registered. Try using .modify() instead.`);
    }

    this.forceRegister(definitionId, instance);
  }

  override(definitionId: symbol, instance: V) {
    // TODO: we need to treat ScopeRegistry as a partial registry, as all the values will be present only when objects are linked
    // if (!this._registrations.has(definitionId)) {
    //   throw new Error(`Instance with id ${definitionId.toString()} not registered. Try using .register() instead.`);
    // }

    this.forceOverride(definitionId, instance);
  }

  private assertMutable(definitionId: symbol) {
    if (this._isFrozen) {
      throw new Error(`Cannot override instance with id ${definitionId.toString()} in frozen ScopeRegistry.`);
    }
  }

  protected withParent(_parent: IReadonlyScopeRegistry<V>): ScopeRegistry<V> {
    if (this._parent) {
      throw new Error(
        `ScopeRegistry is already linked to some parent. You most likely don't wanna continue with this.`,
      );
    }

    return new ScopeRegistry(this._registrations, _parent, this._prev);
  }

  protected withPrev(_prev: IReadonlyScopeRegistry<V>): ScopeRegistry<V> {
    if (this._prev) {
      throw new Error(
        `ScopeRegistry is already linked to some previous registry. You most likely don't wanna continue with this.`,
      );
    }

    return new ScopeRegistry(this._registrations, this._parent, _prev);
  }

  checkoutScope(others: ScopeRegistry<V>[]): ScopeRegistry<V> {
    const scopeEntries = ScopeRegistry.empty<V>().appendPrevious(others);

    return scopeEntries.withParent(this);
  }

  forEach(iterFn: (value: V) => void) {
    this._parent?.forEach(iterFn);

    this._registrations.forEach(iterFn);
    this._overrides.forEach(iterFn);
  }

  private appendPrevious(others: Array<ScopeRegistry<V>>) {
    if (others.length === 0) {
      return new ScopeRegistry(this._registrations, this._parent, this._prev);
    }

    return others.reduce((parentRegistry, registry) => registry.withPrev(parentRegistry), this);
  }
}
