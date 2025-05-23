import { COWMap } from './COWMap.js';

export class ScopeRegistry<V> {
  static create<V>(): ScopeRegistry<V> {
    return new ScopeRegistry<V>(false, COWMap.create<V>());
  }

  static inheritFrom<V>(_prev: ScopeRegistry<V>): ScopeRegistry<V> {
    return new ScopeRegistry<V>(true, COWMap.create<V>(), _prev);
  }

  private _overrides = new Map<symbol, V>();

  constructor(
    protected _isFrozen: boolean,
    protected _registrations: COWMap<V>,
    protected _prev?: ScopeRegistry<V>,
  ) {}

  findRegistration(definitionId: symbol): V | undefined {
    return this._registrations.get(definitionId) ?? this._prev?.findRegistration(definitionId);
  }

  findOverride(definitionId: symbol): V | undefined {
    return this._overrides.get(definitionId) ?? this._prev?.findOverride(definitionId);
  }

  find(definitionId: symbol): V | undefined {
    return this._overrides.get(definitionId) ?? this._registrations.get(definitionId) ?? this._prev?.find(definitionId);
  }

  get(definitionId: symbol): V {
    const definition =
      this._overrides.get(definitionId) ?? this._registrations.get(definitionId) ?? this._prev?.get(definitionId);

    if (!definition) {
      throw new Error(`No definition registered for ${definitionId.toString()}`);
    }

    return definition;
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

  protected getRegistered(definitionId: symbol): V {
    const definition = this._registrations.get(definitionId);

    if (definition) {
      return definition;
    } else {
      const parentDefinition = this._prev?.getRegistered(definitionId);

      if (parentDefinition) {
        return parentDefinition;
      } else {
        throw new Error(`No definition registered for ${definitionId.toString()}`);
      }
    }
  }

  forceRegister(definitionId: symbol, instance: V) {
    this.assertMutable(definitionId);

    this._registrations.set(definitionId, instance);
  }

  forceOverride(definitionId: symbol, instance: V) {
    this.assertMutable(definitionId);

    this._overrides.set(definitionId, instance);
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

  checkoutForScope() {
    return new ScopeRegistry(false, this._registrations.clone());
  }

  private assertMutable(definitionId: symbol) {
    if (this._isFrozen) {
      throw new Error(`Cannot override instance with id ${definitionId.toString()} in frozen ScopeRegistry.`);
    }
  }

  withParent(_prev: ScopeRegistry<V>, freeze = false): ScopeRegistry<V> {
    if (this._prev) {
      throw new Error(
        `ScopeRegistry is already linked to some parent. You most likely don't wanna continue with this.`,
      );
    }

    return new ScopeRegistry(freeze, this._registrations, _prev);
  }
}
