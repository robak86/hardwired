import type { IDefinitionTransform } from '../configuration/dsl/new/utils/abstract/IDefinitionTransform.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../definitions/abstract/IDefinition.js';

export class DefinitionsTransformsRegistry {
  private _isFrozen = false;

  static empty(): DefinitionsTransformsRegistry {
    return new DefinitionsTransformsRegistry(
      new Map<symbol, IDefinitionTransform<unknown, LifeTime>[]>(),
      new Map<symbol, IDefinitionTransform<unknown, LifeTime>[]>(),
    );
  }

  static root(others: Array<DefinitionsTransformsRegistry>): DefinitionsTransformsRegistry {
    return DefinitionsTransformsRegistry.empty().checkoutScope(others);
  }

  protected constructor(
    private _definitionsTransforms: Map<symbol, IDefinitionTransform<unknown, LifeTime>[]>,
    private _frozenDefinitionsTransforms: Map<symbol, IDefinitionTransform<unknown, LifeTime>[]>,
    private _prev?: DefinitionsTransformsRegistry,
    private _parent?: DefinitionsTransformsRegistry,
  ) {}

  checkoutScope(other: Array<DefinitionsTransformsRegistry>) {
    return DefinitionsTransformsRegistry.empty().appendPrevious(other).withParent(this);
  }

  private withParent(parent: DefinitionsTransformsRegistry): DefinitionsTransformsRegistry {
    if (this._parent) {
      throw new Error(
        `LazyDefinitionsRegistry is already linked to some parent. You most likely don't wanna continue with this.`,
      );
    }

    return new DefinitionsTransformsRegistry(
      this._definitionsTransforms,
      this._frozenDefinitionsTransforms,
      this._prev,
      parent,
    );
  }

  private withPrev(prev: DefinitionsTransformsRegistry): DefinitionsTransformsRegistry {
    if (this._prev) {
      throw new Error(
        `LazyDefinitionsRegistry is already linked to some previous registry. You most likely don't wanna continue with this.`,
      );
    }

    return new DefinitionsTransformsRegistry(
      this._definitionsTransforms,
      this._frozenDefinitionsTransforms,
      prev,
      this._parent,
    );
  }

  append(definitionTransform: IDefinitionTransform<unknown, LifeTime>) {
    this.assertNotFrozen();

    if (!this._definitionsTransforms.has(definitionTransform.token.id)) {
      this._definitionsTransforms.set(definitionTransform.token.id, []);
    }

    this._definitionsTransforms.get(definitionTransform.token.id)!.push(definitionTransform);
  }

  hasOwn(id: symbol): boolean {
    return (
      this._definitionsTransforms.has(id) ||
      this._frozenDefinitionsTransforms.has(id) ||
      this._prev?.hasOwn(id) ||
      false
    );
  }

  has(id: symbol): boolean {
    return this.hasOwn(id) || this._prev?.has(id) || this._parent?.has(id) || false;
  }

  getOwnFrozen(id: symbol): IDefinitionTransform<unknown, LifeTime>[] {
    return [...(this._frozenDefinitionsTransforms.get(id) ?? []), ...(this._prev?.getOwnFrozen(id) ?? [])];
  }

  getOwnDefinitions(id: symbol): IDefinitionTransform<unknown, LifeTime>[] {
    return [...(this._definitionsTransforms.get(id) ?? []), ...(this._prev?.getOwnDefinitions(id) ?? [])];
  }

  getOwn(id: symbol): IDefinitionTransform<unknown, LifeTime>[] {
    const ownFrozen = this.getOwnFrozen(id);

    if (ownFrozen.length > 0) {
      return ownFrozen;
    }

    return this.getOwnDefinitions(id);
  }

  getAll(id: symbol): IDefinitionTransform<unknown, LifeTime>[] {
    return [
      ...(this._parent?.getAll(id) ?? []),
      ...(this._prev?.getAll(id) ?? []),
      ...(this._definitionsTransforms.get(id) ?? []),
    ];
  }

  apply<TInstance, TLifeTime extends LifeTime>(
    definition: IDefinition<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> {
    // for a singleton we need to collect all transformations from all scopes, as we might be instantiating it in a child scope
    const definitionsTransforms =
      definition.strategy === LifeTime.singleton
        ? this.getAll(definition.id)
        : (this._definitionsTransforms.get(definition.id) ?? []);

    const frozenTransforms = this._frozenDefinitionsTransforms.get(definition.id) ?? [];

    if (frozenTransforms.length > 0) {
      return frozenTransforms.reduce((composed, current) => {
        return current.build(composed) as IDefinition<TInstance, TLifeTime>;
      }, definition);
    }

    if (definitionsTransforms.length > 0) {
      return definitionsTransforms.reduce((composed, current) => {
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

  private appendPrevious(others: Array<DefinitionsTransformsRegistry>) {
    if (others.length === 0) {
      return new DefinitionsTransformsRegistry(
        this._definitionsTransforms,
        this._frozenDefinitionsTransforms,
        this._parent,
        this._prev,
      );
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
