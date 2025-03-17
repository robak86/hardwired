import type { AnyDefinition } from '../definitions/abstract/IDefinition.js';

import { COWMap } from './InstancesMap.js';

export interface IBindingRegistryRead {
  hasFrozenBinding(definitionId: symbol): boolean;
  hasScopeDefinition(definitionId: symbol): boolean;
  hasCascadingDefinition(definitionId: symbol): boolean;
}

export class BindingsRegistry implements IBindingRegistryRead {
  static create(): BindingsRegistry {
    return new BindingsRegistry(COWMap.create(), COWMap.create(), COWMap.create(), new Map());
  }

  constructor(
    private _scopeDefinitions: COWMap<AnyDefinition>,
    private _frozenDefinitions: COWMap<AnyDefinition>,
    private _cascadingDefinitions: COWMap<AnyDefinition>,
    private _ownCascadingDefinitions: Map<symbol, AnyDefinition>,
  ) {}

  checkoutForScope(): BindingsRegistry {
    return new BindingsRegistry(
      COWMap.create(),
      this._frozenDefinitions.clone(),
      this._cascadingDefinitions.clone(),
      new Map(),
    );
  }

  getDefinition<T extends AnyDefinition>(definition: T): T {
    return (
      // returned by priority. Frozen overrides scope, scope overrides cascading, cascading overrides definition
      (this._frozenDefinitions.get(definition.id) as T) ??
      (this._scopeDefinitions.get(definition.id) as T) ??
      (this._cascadingDefinitions.get(definition.id) as T) ??
      definition
    );
  }

  hasFrozenBinding(definitionId: symbol): boolean {
    return this._frozenDefinitions.has(definitionId);
  }

  hasScopeDefinition(definitionId: symbol): boolean {
    return this._scopeDefinitions.has(definitionId);
  }

  inheritsCascadingDefinition(definitionId: symbol): boolean {
    return this._cascadingDefinitions.has(definitionId) && !this._ownCascadingDefinitions.has(definitionId);
  }

  hasCascadingDefinition(definitionId: symbol): boolean {
    return this._cascadingDefinitions.has(definitionId);
  }

  addFrozenBinding(definition: AnyDefinition) {
    if (this._frozenDefinitions.has(definition.id)) {
      throw new Error(`Final binding was already set. Cannot override it.`);
    }

    this._frozenDefinitions.set(definition.id, definition);
  }

  addScopeBinding(definition: AnyDefinition) {
    if (this._scopeDefinitions.has(definition.id)) {
      throw new Error(
        `Cannot bind definition for the current scope. The scope has already other binding for the definition.`,
      );
    }

    this._scopeDefinitions.set(definition.id, definition);
  }

  /**
   * Registers cascading binding for the current scope and all child scopes.
   * Cascading definition is a definition that is bound to scope (Definition#bind(container)).
   * When we register cascading definition here, it gets inherited by all child binding registries, so effectively
   * whenever we try to resolve the definition in some child scope, we will get the definition instantiated in
   * the scope that is bound to the definition override.
   *
   * @param definition - definition bound to some particular scope
   */
  addCascadingBinding(definition: AnyDefinition) {
    if (this._scopeDefinitions.has(definition.id)) {
      throw new Error(
        `Cannot bind cascading definition for the current scope. The scope has already other binding for the definition.`,
      );
    }

    this._cascadingDefinitions.set(definition.id, definition);
    this._ownCascadingDefinitions.set(definition.id, definition);
  }
}
