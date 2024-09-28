import { Overrides } from '../container/Overrides.js';
import { Definition } from '../definitions/abstract/Definition.js';
import { ScopeOptions } from '../container/Container.js';

/**
 * This class represents a registry for storing definitions overrides for scope.
 */
export class BindingsRegistry {
  static create(options?: Pick<ScopeOptions, 'scopeDefinitions' | 'frozenDefinitions'>): BindingsRegistry {
    const registry = new BindingsRegistry(new Map(), new Map());

    registry.addScopeBindings(options?.scopeDefinitions ?? []);
    registry.addFinalBindings(options?.frozenDefinitions ?? []);

    return registry;
  }

  constructor(
    private scopeBindingsById: Map<symbol, Definition<any, any, any>>,
    private finalBindingsById: Map<symbol, Definition<any, any, any>>,
  ) {}

  clone() {
    return new BindingsRegistry({ ...this.scopeBindingsById }, { ...this.finalBindingsById });
  }

  checkoutForScope(scopeBindings: Overrides, finalBindings: Overrides): BindingsRegistry {
    const newRegistry = new BindingsRegistry(
      new Map(this.scopeBindingsById), // TODO: experiment with proxy object instead of cloning?
      new Map(this.finalBindingsById),
    );
    newRegistry.addScopeBindings(scopeBindings);
    newRegistry.addFinalBindings(finalBindings);
    return newRegistry;
  }

  getDefinition<T extends Definition<any, any, any>>(definition: T): T {
    const id = definition.id;

    if (this.finalBindingsById.has(id)) {
      return this.finalBindingsById.get(id) as T;
    }

    if (this.scopeBindingsById.has(id)) {
      return this.scopeBindingsById.get(id) as T;
    }

    return definition;
  }

  hasFinalBinding(definitionId: symbol): boolean {
    return !!this.finalBindingsById.has(definitionId);
  }

  private addFinalBinding = (definition: Definition<any, any, any>) => {
    if (this.finalBindingsById.has(definition.id)) {
      throw new Error(`Final binding was already set. Cannot override it.`);
    }
    this.finalBindingsById.set(definition.id, definition);
  };

  private updateScopeBinding(definition: Definition<any, any, any>) {
    this.scopeBindingsById.set(definition.id, definition);
  }

  private addFinalBindings(patches: Overrides) {
    patches.forEach(patchedResolver => {
      this.addFinalBinding(patchedResolver);
    });
  }

  private addScopeBindings(patches: Overrides) {
    patches.forEach(patchedResolver => {
      this.updateScopeBinding(patchedResolver);
    });
  }
}
