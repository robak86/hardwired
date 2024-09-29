import { Definition } from '../definitions/abstract/Definition.js';
import { ScopeOptions } from '../container/Container.js';

/**
 * This class represents a registry for storing definitions overrides for scope.
 */
export class BindingsRegistry {
  static create(
    options?: Pick<ScopeOptions, 'scopeDefinitions' | 'frozenDefinitions' | 'cascadingDefinitions'>,
  ): BindingsRegistry {
    const registry = new BindingsRegistry(new Map(), new Map(), new Map());

    registry.addScopeBindings(options?.scopeDefinitions ?? []);
    registry.addFrozenBindings(options?.frozenDefinitions ?? []);
    registry.addCascadingBindings(options?.cascadingDefinitions ?? []);

    return registry;
  }

  constructor(
    private _scopeBindingsById: Map<symbol, Definition<any, any, any>>,
    private _frozenBindingsById: Map<symbol, Definition<any, any, any>>,
    private _cascadingBindingsById: Map<symbol, Definition<any, any, any>>,
  ) {}

  // TODO: convert the arguments into object
  checkoutForScope(
    scopeBindings: readonly Definition<any, any, any>[],
    frozenBindings: readonly Definition<any, any, any>[],
    cascadingBindings: readonly Definition<any, any, any>[],
  ): BindingsRegistry {
    const newRegistry = new BindingsRegistry(
      new Map(this._scopeBindingsById), // TODO: experiment with proxy object instead of cloning?
      new Map(this._frozenBindingsById),
      new Map(this._cascadingBindingsById),
    );
    newRegistry.addScopeBindings(scopeBindings);
    newRegistry.addFrozenBindings(frozenBindings);
    newRegistry.addCascadingBindings(cascadingBindings);
    return newRegistry;
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

  private addFinalBinding = (definition: Definition<any, any, any>) => {
    if (this._frozenBindingsById.has(definition.id)) {
      throw new Error(`Final binding was already set. Cannot override it.`);
    }
    this._frozenBindingsById.set(definition.id, definition);
  };

  private updateScopeBinding(definition: Definition<any, any, any>) {
    this._scopeBindingsById.set(definition.id, definition);
  }

  private addFrozenBindings(patches: readonly Definition<any, any, any>[]) {
    patches.forEach(patchedResolver => {
      this.addFinalBinding(patchedResolver);
    });
  }

  private addScopeBindings(patches: readonly Definition<any, any, any>[]) {
    patches.forEach(patchedResolver => {
      this.updateScopeBinding(patchedResolver);
    });
  }

  private addCascadingBindings(cascadingBindings: readonly Definition<any, any, any>[]) {
    cascadingBindings.forEach(definition => {
      this._cascadingBindingsById.set(definition.id, definition);
    });
  }
}
