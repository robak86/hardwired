import { Overrides } from '../container/Overrides.js';
import { Definition } from '../definitions/abstract/Definition.js';
import { ScopeOptions } from '../container/Container.js';

/**
 * This class represents a registry for storing definitions overrides for scope.
 */
export class BindingsRegistry {
  static create(options?: Pick<ScopeOptions, 'scopeDefinitions' | 'frozenDefinitions'>): BindingsRegistry {
    const registry = new BindingsRegistry({}, {});

    registry.addScopeBindings(options?.scopeDefinitions ?? []);
    registry.addFinalBindings(options?.frozenDefinitions ?? []);

    return registry;
  }

  constructor(
    private scopeBindingsById: Record<string, Definition<any, any, any>>,
    private finalBindingsById: Record<string, Definition<any, any, any>>,
  ) {}

  clone() {
    return new BindingsRegistry({ ...this.scopeBindingsById }, { ...this.finalBindingsById });
  }

  checkoutForScope(scopeBindings: Overrides, finalBindings: Overrides): BindingsRegistry {
    const newRegistry = new BindingsRegistry(
      { ...this.scopeBindingsById }, // TODO: experiment with proxy object instead of cloning?
      { ...this.finalBindingsById },
    );
    newRegistry.addScopeBindings(scopeBindings);
    newRegistry.addFinalBindings(finalBindings);
    return newRegistry;
  }

  getDefinition<T extends Definition<any, any, any>>(definition: T): T {
    const id = definition.id;

    if (this.finalBindingsById[id]) {
      return this.finalBindingsById[id] as T;
    }

    if (this.scopeBindingsById[id]) {
      return this.scopeBindingsById[id] as T;
    }

    return definition;
  }

  hasFinalBinding(definitionId: string): boolean {
    return !!this.finalBindingsById[definitionId];
  }

  addScopeBinding = (definition: Definition<any, any, any>) => {
    this.updateScopeBinding(definition);
  };

  addFinalBinding = (definition: Definition<any, any, any>) => {
    if (this.finalBindingsById[definition.id]) {
      throw new Error(`Final binding with id ${definition.id} was already set. Cannot override it.`);
    }
    this.finalBindingsById[definition.id] = definition;
  };

  private updateScopeBinding(definition: Definition<any, any, any>) {
    this.scopeBindingsById[definition.id] = definition;
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
