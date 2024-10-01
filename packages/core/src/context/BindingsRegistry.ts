import { Definition } from '../definitions/abstract/Definition.js';

/**
 * This class represents a registry for storing definitions overrides for scope.
 */
export class BindingsRegistry {
  static create(): BindingsRegistry {
    return new BindingsRegistry(new Map(), new Map(), new Map());
  }

  constructor(
    private _scopeBindingsById: Map<symbol, Definition<any, any, any>>,
    private _frozenBindingsById: Map<symbol, Definition<any, any, any>>,
    private _cascadingBindingsById: Map<symbol, Definition<any, any, any>>,
  ) {}

  checkoutForScope(): BindingsRegistry {
    return new BindingsRegistry(new Map(), new Map(this._frozenBindingsById), new Map(this._cascadingBindingsById));
  }

  getDefinition<T extends Definition<any, any, any>>(definition: T): T {
    const id = definition.id;

    if (this._frozenBindingsById.has(id)) {
      return this._frozenBindingsById.get(id) as T;
    }

    if (this._cascadingBindingsById.has(id)) {
      return this._cascadingBindingsById.get(id) as T;
    }

    if (this._scopeBindingsById.has(id)) {
      return this._scopeBindingsById.get(id) as T;
    }

    return definition;
  }

  hasFrozenBinding(definitionId: symbol): boolean {
    return this._frozenBindingsById.has(definitionId);
  }

  addFrozenBinding = (definition: Definition<any, any, any>) => {
    if (this._frozenBindingsById.has(definition.id)) {
      throw new Error(`Final binding was already set. Cannot override it.`);
    }
    this._frozenBindingsById.set(definition.id, definition);
  };

  addScopeBinding(definition: Definition<any, any, any>) {
    if (this._scopeBindingsById.has(definition.id)) {
      throw new Error(`Definition is already set for the scope. Cannot override it.`);
    }

    this._scopeBindingsById.set(definition.id, definition);
  }

  addCascadingBinding(definition: Definition<any, any, any>) {
    this._cascadingBindingsById.set(definition.id, definition);
  }
}
