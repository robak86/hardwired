import { Overrides } from '../container/Overrides.js';
import { BaseDefinition } from '../definitions/abstract/BaseDefinition.js';

/**
 * This class represents a registry for storing definitions overrides for scope.
 */
export class InstancesDefinitionsRegistry {
  static empty(): InstancesDefinitionsRegistry {
    return new InstancesDefinitionsRegistry({}, {});
  }

  static create(scopeOverrides: Overrides, globalOverrides: Overrides): InstancesDefinitionsRegistry {
    const registry = InstancesDefinitionsRegistry.empty();

    registry.addScopeOverrides(scopeOverrides);
    registry.addGlobalOverrides(globalOverrides);

    return registry;
  }

  constructor(
    private scopeOverrideDefinitionsById: Record<string, BaseDefinition<any, any, any, any>>,
    private globalOverrideDefinitionsById: Record<string, BaseDefinition<any, any, any, any>>,
  ) {}

  addScopeOverride(definition: BaseDefinition<any, any, any, any>) {
    this.updateScopeOverride(definition);
  }

  checkoutForScope(scopeResolversOverrides: Overrides) {
    const newRegistry = new InstancesDefinitionsRegistry(
      { ...this.scopeOverrideDefinitionsById }, // TODO: experiment with proxy object instead of cloning?
      this.globalOverrideDefinitionsById,
    );
    newRegistry.addScopeOverrides(scopeResolversOverrides);
    return newRegistry;
  }

  getInstanceDefinition<T extends BaseDefinition<any, any, any, any>>(instanceDefinition: T): T {
    const id = instanceDefinition.id;

    if (this.globalOverrideDefinitionsById[id]) {
      return this.globalOverrideDefinitionsById[id] as T;
    }

    if (this.scopeOverrideDefinitionsById[id]) {
      return this.scopeOverrideDefinitionsById[id] as T;
    }

    return instanceDefinition;
  }

  hasGlobalOverrideDefinition(resolverId: string): boolean {
    return !!this.globalOverrideDefinitionsById[resolverId];
  }

  private updateScopeOverride(resolver: BaseDefinition<any, any, any, any>) {
    this.scopeOverrideDefinitionsById[resolver.id] = resolver;
  }

  private addGlobalOverrideResolver(resolver: BaseDefinition<any, any, any, any>) {
    if (this.globalOverrideDefinitionsById[resolver.id]) {
      throw new Error(`Invariant resolves cannot be updated after container creation`);
    }
    this.globalOverrideDefinitionsById[resolver.id] = resolver;
  }

  private addGlobalOverrides(patches: Overrides) {
    patches.forEach(patchedResolver => {
      this.addGlobalOverrideResolver(patchedResolver);
    });
  }

  private addScopeOverrides(patches: Overrides) {
    patches.forEach(patchedResolver => {
      this.updateScopeOverride(patchedResolver);
    });
  }
}
