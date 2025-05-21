import { COWMap } from './COWMap.js';

export class ScopeRegistry<V> {
  static create<V>(): ScopeRegistry<V> {
    return new ScopeRegistry<V>(COWMap.create<V>());
  }

  private _overrides = new Map<symbol, V>();

  constructor(private _registrations: COWMap<V>) {}

  get(definitionId: symbol): V | undefined {
    return this._overrides.get(definitionId) ?? this.getRegistered(definitionId);
  }

  getRegistered(definitionId: symbol): V {
    const definition = this._registrations.get(definitionId);

    if (!definition) {
      throw new Error(`No definition registered for ${definitionId.toString()}`);
    }

    return definition;
  }

  register(definitionId: symbol, instance: V) {
    if (this._registrations.has(definitionId)) {
      throw new Error(`Instance with id ${definitionId.toString()} already registered. Try using .modify() instead.`);
    }

    this._registrations.set(definitionId, instance);
  }

  override(definitionId: symbol, instance: V) {
    if (!this._registrations.has(definitionId)) {
      throw new Error(`Instance with id ${definitionId.toString()} not registered. Try using .register() instead.`);
    }

    this._registrations.set(definitionId, instance);
  }

  checkoutForScope() {
    return new ScopeRegistry(this._registrations);
  }
}
