import type { ILazyDefinitionBuilder } from '../configuration/dsl/new/utils/abstract/ILazyDefinitionBuilder.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../definitions/abstract/IDefinition.js';

export class LazyDefinitionsRegistry {
  private _isFrozen = false;

  static empty(): LazyDefinitionsRegistry {
    return new LazyDefinitionsRegistry(
      new Map<symbol, ILazyDefinitionBuilder<unknown, LifeTime>[]>(),
      new Map<symbol, ILazyDefinitionBuilder<unknown, LifeTime>[]>(),
    );
  }

  static root(others: Array<LazyDefinitionsRegistry>): LazyDefinitionsRegistry {
    return LazyDefinitionsRegistry.empty().checkoutScope(others);
  }

  protected constructor(
    private _lazyDefinitions: Map<symbol, ILazyDefinitionBuilder<unknown, LifeTime>[]>,
    private _frozenLazyDefinitions: Map<symbol, ILazyDefinitionBuilder<unknown, LifeTime>[]>,
    private _prev?: LazyDefinitionsRegistry,
    private _parent?: LazyDefinitionsRegistry,
  ) {}

  checkoutScope(other: Array<LazyDefinitionsRegistry>) {
    return LazyDefinitionsRegistry.empty().appendPrevious(other).withParent(this);
  }

  private withParent(parent: LazyDefinitionsRegistry): LazyDefinitionsRegistry {
    if (this._parent) {
      throw new Error(
        `LazyDefinitionsRegistry is already linked to some parent. You most likely don't wanna continue with this.`,
      );
    }

    return new LazyDefinitionsRegistry(this._lazyDefinitions, this._frozenLazyDefinitions, this._prev, parent);
  }

  private withPrev(prev: LazyDefinitionsRegistry): LazyDefinitionsRegistry {
    if (this._prev) {
      throw new Error(
        `LazyDefinitionsRegistry is already linked to some previous registry. You most likely don't wanna continue with this.`,
      );
    }

    return new LazyDefinitionsRegistry(this._lazyDefinitions, this._frozenLazyDefinitions, prev, this._parent);
  }

  append(lazyDefinition: ILazyDefinitionBuilder<unknown, LifeTime>) {
    this.assertNotFrozen();

    if (!this._lazyDefinitions.has(lazyDefinition.token.id)) {
      this._lazyDefinitions.set(lazyDefinition.token.id, []);
    }

    this._lazyDefinitions.get(lazyDefinition.token.id)!.push(lazyDefinition);
  }

  appendFrozen(lazyDefinition: ILazyDefinitionBuilder<unknown, LifeTime>) {
    this.assertNotFrozen();

    if (!this._frozenLazyDefinitions.has(lazyDefinition.token.id)) {
      this._frozenLazyDefinitions.set(lazyDefinition.token.id, []);
    }

    this._frozenLazyDefinitions.get(lazyDefinition.token.id)!.push(lazyDefinition);
  }

  hasOwn(id: symbol): boolean {
    return this._lazyDefinitions.has(id) || this._frozenLazyDefinitions.has(id) || this._prev?.hasOwn(id) || false;
  }

  has(id: symbol): boolean {
    return this.hasOwn(id) || this._prev?.has(id) || false;
  }

  getOwnFrozen(id: symbol): ILazyDefinitionBuilder<unknown, LifeTime>[] {
    return [...(this._frozenLazyDefinitions.get(id) ?? []), ...(this._prev?.getOwnFrozen(id) ?? [])];
  }

  getOwnDefinitions(id: symbol): ILazyDefinitionBuilder<unknown, LifeTime>[] {
    return [...(this._lazyDefinitions.get(id) ?? []), ...(this._prev?.getOwnDefinitions(id) ?? [])];
  }

  getOwn(id: symbol): ILazyDefinitionBuilder<unknown, LifeTime>[] {
    const ownFrozen = this.getOwnFrozen(id);

    if (ownFrozen.length > 0) {
      return ownFrozen;
    }

    return this.getOwnDefinitions(id);
  }

  apply<TInstance, TLifeTime extends LifeTime>(
    definition: IDefinition<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> {
    const lazyDefinitions = this._lazyDefinitions.get(definition.id) ?? [];
    const frozenLazyDefinitions = this._frozenLazyDefinitions.get(definition.id) ?? [];

    if (frozenLazyDefinitions.length > 0) {
      return frozenLazyDefinitions.reduce((composed, current) => {
        return current.build(composed) as IDefinition<TInstance, TLifeTime>;
      }, definition);
    }

    if (lazyDefinitions.length > 0) {
      return lazyDefinitions.reduce((composed, current) => {
        return current.build(composed) as IDefinition<TInstance, TLifeTime>;
      }, definition);
    }

    return definition;
  }

  private assertNotFrozen() {
    if (this._isFrozen) {
      throw new Error('Cannot modify frozen LazyDefinitionsRegistry.');
    }
  }

  private appendPrevious(others: Array<LazyDefinitionsRegistry>) {
    if (others.length === 0) {
      return new LazyDefinitionsRegistry(this._lazyDefinitions, this._frozenLazyDefinitions, this._parent, this._prev);
    }

    return others.reduce((parentRegistry, registry) => registry.withPrev(parentRegistry), this);
  }

  freeze() {
    if (this._isFrozen) {
      throw new Error('LazyDefinitionsRegistry is already frozen.');
    }

    this._isFrozen = true;

    return this;
  }
}
