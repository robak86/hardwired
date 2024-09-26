import { Overrides } from '../container/Overrides.js';
import { BaseDefinition } from '../definitions/abstract/BaseDefinition.js';
import { ScopeOptions } from '../container/Container.js';

/**
 * This class represents a registry for storing definitions overrides for scope.
 */
export class BindingsRegistry {
  static empty(): BindingsRegistry {
    return new BindingsRegistry({}, {});
  }

  static create(options: Pick<ScopeOptions, 'scope' | 'final'>): BindingsRegistry {
    const registry = BindingsRegistry.empty();

    registry.addScopeBindings(options.scope ?? []);
    registry.addFinalBindings(options.final ?? []);

    return registry;
  }

  constructor(
    private scopeBindingsById: Record<string, BaseDefinition<any, any, any>>,
    private finalBindingsById: Record<string, BaseDefinition<any, any, any>>,
  ) {}

  addScopeOverride(definition: BaseDefinition<any, any, any>) {
    this.updateScopeBinding(definition);
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

  getDefinition<T extends BaseDefinition<any, any, any>>(definition: T): T {
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

  private updateScopeBinding(definition: BaseDefinition<any, any, any>) {
    this.scopeBindingsById[definition.id] = definition;
  }

  private addFinalBinding(definition: BaseDefinition<any, any, any>) {
    if (this.finalBindingsById[definition.id]) {
      throw new Error(`Final binding with id ${definition.id} was already set. Cannot override it.`);
    }
    this.finalBindingsById[definition.id] = definition;
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