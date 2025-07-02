import type { IDefinitionTransform } from '../configuration/dsl/new/utils/abstract/IDefinitionTransform.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../definitions/abstract/IDefinition.js';

export class DefinitionsTransformsRegistry {
  private _isFrozen = false;

  static empty(): DefinitionsTransformsRegistry {
    return new DefinitionsTransformsRegistry(
      new Map<symbol, IDefinitionTransform<unknown, LifeTime>[]>(),
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
    private _inheritTransforms: Map<symbol, IDefinitionTransform<unknown, LifeTime>[]>,
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
      this._inheritTransforms,
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
      this._inheritTransforms,
      prev,
      this._parent,
    );
  }

  append(definitionTransform: IDefinitionTransform<unknown, LifeTime>) {
    this.assertNotFrozen();

    // Route inherit transforms to separate collection
    const targetMap =
      definitionTransform.transformType === 'inherit' ? this._inheritTransforms : this._definitionsTransforms;

    if (!targetMap.has(definitionTransform.token.id)) {
      targetMap.set(definitionTransform.token.id, []);
    }

    targetMap.get(definitionTransform.token.id)!.push(definitionTransform);
  }

  hasOwn(id: symbol): boolean {
    return (
      this._definitionsTransforms.has(id) ||
      this._frozenDefinitionsTransforms.has(id) ||
      this._inheritTransforms.has(id) ||
      this._prev?.hasOwn(id) ||
      false
    );
  }

  hasOwnInherit(id: symbol): boolean {
    return this._inheritTransforms.has(id) || this._prev?.hasOwnInherit(id) || false;
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

  getOwnInheritTransforms(id: symbol): IDefinitionTransform<unknown, LifeTime>[] {
    return [...(this._inheritTransforms.get(id) ?? []), ...(this._prev?.getOwnInheritTransforms(id) ?? [])];
  }

  getParentInheritTransforms(id: symbol): IDefinitionTransform<unknown, LifeTime>[] {
    return this._parent?.getAllInheritTransforms(id) ?? [];
  }

  getAllInheritTransforms(id: symbol): IDefinitionTransform<unknown, LifeTime>[] {
    return [
      ...(this._parent?.getAllInheritTransforms(id) ?? []),
      ...(this._prev?.getAllInheritTransforms(id) ?? []),
      ...(this._inheritTransforms.get(id) ?? []),
    ];
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
    // Check frozen transforms first - they take precedence
    const frozenTransforms = this.getOwnFrozen(definition.id);
    if (frozenTransforms.length > 0) {
      return frozenTransforms.reduce((composed, current) => {
        return current.build(composed) as IDefinition<TInstance, TLifeTime>;
      }, definition);
    }

    // Get all accumulated regular transforms (decorate/configure) from parent chain
    // These always accumulate
    const regularTransforms = this.getAll(definition.id);

    // Inherit transforms: only own scope's (parent's inherit already applied to parent's value)
    // Multiple .inherit() calls within same scope DO accumulate
    // Parent's inherit was already applied when producing the inherited value via shadowing definition
    const inheritTransforms = this.getOwnInheritTransforms(definition.id);

    const combinedTransforms = [...regularTransforms, ...inheritTransforms];

    if (combinedTransforms.length > 0) {
      return combinedTransforms.reduce((composed, current) => {
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
        this._inheritTransforms,
        this._prev,
        this._parent,
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
