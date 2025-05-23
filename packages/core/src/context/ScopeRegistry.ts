import { COWMap } from './COWMap.js';

export interface IReadonlyScopeRegistry<V, TType> {
  findRegistration(definitionId: symbol): V | undefined;
  findOverride(definitionId: symbol): V | undefined;
  find(definitionId: symbol): V | undefined;
  get(definitionId: symbol): V;
  has(definitionId: symbol): boolean;
  getForOverride(definitionId: symbol): V;
  forEach(iterFn: (value: V) => void): void;
  forEachType(type: TType, iterFn: (value: V) => void): void;
}

export class ScopeRegistry<V, TType> implements IReadonlyScopeRegistry<V, TType> {
  static create<V, TType>(typeSelector: (value: V) => TType): ScopeRegistry<V, TType> {
    return new ScopeRegistry<V, TType>(false, typeSelector, COWMap.create<V>());
  }

  private _overrides = new Map<symbol, V>();
  private _byType = new Map<TType, Set<symbol>>();

  constructor(
    protected _isFrozen: boolean,
    protected _typeSelector: (value: V) => TType,
    protected _registrations: COWMap<V>,
    protected _prev?: IReadonlyScopeRegistry<V, TType>,
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
  has(definitionId: symbol): boolean {
    return (
      this._overrides.has(definitionId) ||
      this._registrations.has(definitionId) ||
      Boolean(this._prev?.has(definitionId))
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

    this.upsertByType(definitionId, instance);
    this._registrations.set(definitionId, instance);
  }

  forceOverride(definitionId: symbol, instance: V) {
    this.assertMutable(definitionId);

    this.upsertByType(definitionId, instance);
    this._overrides.set(definitionId, instance);
  }

  append(definitionId: symbol, instance: V) {
    this.assertMutable(definitionId);

    const current = this._registrations.get(definitionId);

    this.upsertByType(definitionId, instance);

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

  checkoutForScope() {
    return new ScopeRegistry(false, this._typeSelector, this._registrations.clone());
  }

  private assertMutable(definitionId: symbol) {
    if (this._isFrozen) {
      throw new Error(`Cannot override instance with id ${definitionId.toString()} in frozen ScopeRegistry.`);
    }
  }

  withParent(_prev: IReadonlyScopeRegistry<V, TType>, freeze = false): ScopeRegistry<V, TType> {
    if (this._prev) {
      throw new Error(
        `ScopeRegistry is already linked to some parent. You most likely don't wanna continue with this.`,
      );
    }

    return new ScopeRegistry(freeze, this._typeSelector, this._registrations, _prev);
  }

  forEach(iterFn: (value: V) => void) {
    this._prev?.forEach(iterFn);

    this._registrations.forEach(iterFn);
    this._overrides.forEach(iterFn);
  }

  forEachType(type: TType, iterFn: (value: V) => void): void {
    this._byType.get(type)?.forEach(definitionId => {
      const instance = this._registrations.get(definitionId) ?? this._overrides.get(definitionId);

      if (instance) {
        iterFn(instance);
      }
    });
  }

  private upsertByType(definitionId: symbol, instance: V) {
    if (!this._byType.has(this._typeSelector(instance))) {
      this._byType.set(this._typeSelector(instance), new Set());
    }

    const set = this._byType.get(this._typeSelector(instance))!;

    set.add(definitionId);
  }
}
