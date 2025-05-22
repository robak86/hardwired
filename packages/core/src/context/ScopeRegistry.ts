import { COWMap } from './COWMap.js';

export class ScopeRegistry<V> {
  static create<V>(): ScopeRegistry<V> {
    return new ScopeRegistry<V>(false, COWMap.create<V>());
  }

  private _overrides = new Map<symbol, V>();

  constructor(
    private _isFrozen: boolean,
    private _registrations: COWMap<V>,
    private _prev?: ScopeRegistry<V>,
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
    return this._overrides.get(definitionId) ?? this.getRegistered(definitionId);
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
    if (this._isFrozen) {
      throw new Error(`Cannot register instance with id ${definitionId.toString()} in frozen ScopeRegistry.`);
    }

    this._registrations.set(definitionId, instance);
  }

  forceOverride(definitionId: symbol, instance: V) {
    if (this._isFrozen) {
      throw new Error(`Cannot override instance with id ${definitionId.toString()} in frozen ScopeRegistry.`);
    }

    this._overrides.set(definitionId, instance);
  }

  register(definitionId: symbol, instance: V) {
    if (this._registrations.has(definitionId)) {
      throw new Error(`Instance with id ${definitionId.toString()} already registered. Try using .modify() instead.`);
    }

    this.forceRegister(definitionId, instance);
  }

  override(definitionId: symbol, instance: V) {
    if (!this._registrations.has(definitionId)) {
      throw new Error(`Instance with id ${definitionId.toString()} not registered. Try using .register() instead.`);
    }

    this.forceOverride(definitionId, instance);
  }

  checkoutForScope() {
    return new ScopeRegistry(false, this._registrations.clone());
  }

  attach(prev: ScopeRegistry<V>) {
    return new ScopeRegistry(true, this._registrations, prev);
  }
}
