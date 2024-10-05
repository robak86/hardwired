import { AnyDefinition } from '../definitions/abstract/Definition.js';
import { COWMap } from './InstancesMap.js';

/**
 * This class represents a registry for storing definitions overrides for scope.
 */
export class BindingsRegistry {
  static create(): BindingsRegistry {
    return new BindingsRegistry(COWMap.create(), COWMap.create(), COWMap.create());
  }

  constructor(
    private _scopeDefinitions: COWMap<AnyDefinition>,
    private _frozenDefinitions: COWMap<AnyDefinition>,
    private _cascadingDefinitions: COWMap<AnyDefinition>,
  ) {}

  checkoutForScope(): BindingsRegistry {
    return new BindingsRegistry(COWMap.create(), this._frozenDefinitions.clone(), this._cascadingDefinitions.clone());
  }

  getDefinition<T extends AnyDefinition>(definition: T): T {
    return (
      (this._frozenDefinitions.get(definition.id) as T) ??
      (this._scopeDefinitions.get(definition.id) as T) ??
      (this._cascadingDefinitions.get(definition.id) as T) ??
      definition
    );
  }

  hasFrozenBinding(definitionId: symbol): boolean {
    return this._frozenDefinitions.has(definitionId);
  }

  addFrozenBinding = (definition: AnyDefinition) => {
    if (this._frozenDefinitions.has(definition.id)) {
      throw new Error(`Final binding was already set. Cannot override it.`);
    }
    this._frozenDefinitions.set(definition.id, definition);
  };

  addScopeBinding(definition: AnyDefinition) {
    if (this._scopeDefinitions.has(definition.id)) {
      throw new Error(
        `Cannot bind definition for the current scope. The scope has already other binding for the definition.`,
      );
    }

    this._scopeDefinitions.set(definition.id, definition);
  }

  addCascadingBinding(definition: AnyDefinition) {
    if (this._scopeDefinitions.has(definition.id)) {
      throw new Error(
        `Cannot bind cascading definition for the current scope. The scope has already other binding for the definition.`,
      );
    }

    this._cascadingDefinitions.set(definition.id, definition);
  }
}
