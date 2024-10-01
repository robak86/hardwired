import { AnyDefinition } from '../definitions/abstract/Definition.js';

/**
 * This class represents a registry for storing definitions overrides for scope.
 */
export class BindingsRegistry {
  static create(): BindingsRegistry {
    return new BindingsRegistry(new Map(), new Map(), new Map());
  }

  constructor(
    private _scopeBindingsById: Map<symbol, AnyDefinition>,
    private _frozenBindingsById: Map<symbol, AnyDefinition>,
    private _cascadingBindingsById: Map<symbol, AnyDefinition>,
  ) {}

  checkoutForScope(): BindingsRegistry {
    return new BindingsRegistry(new Map(), new Map(this._frozenBindingsById), new Map(this._cascadingBindingsById));
  }

  getDefinition<T extends AnyDefinition>(definition: T): T {
    const id = definition.id;

    if (this._frozenBindingsById.has(id)) {
      return this._frozenBindingsById.get(id) as T;
    }

    if (this._scopeBindingsById.has(id)) {
      return this._scopeBindingsById.get(id) as T;
    }

    if (this._cascadingBindingsById.has(id)) {
      return this._cascadingBindingsById.get(id) as T;
    }

    return definition;
  }

  hasFrozenBinding(definitionId: symbol): boolean {
    return this._frozenBindingsById.has(definitionId);
  }

  hasScopeBinding(definitionId: symbol): boolean {
    return this._scopeBindingsById.has(definitionId);
  }

  hasCascadingBinding(definitionId: symbol): boolean {
    return this._cascadingBindingsById.has(definitionId);
  }

  addFrozenBinding = (definition: AnyDefinition) => {
    if (this._frozenBindingsById.has(definition.id)) {
      throw new Error(`Final binding was already set. Cannot override it.`);
    }
    this._frozenBindingsById.set(definition.id, definition);
  };

  addScopeBinding(definition: AnyDefinition) {
    if (this._scopeBindingsById.has(definition.id)) {
      throw new Error(`Cannot bind definition for the current scope. Definition is already set.`);
    }

    this._scopeBindingsById.set(definition.id, definition);
  }

  addCascadingBinding(definition: AnyDefinition) {
    this._cascadingBindingsById.set(definition.id, definition);
  }
}
