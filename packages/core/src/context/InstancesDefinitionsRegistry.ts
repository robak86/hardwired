import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { IDefinition, BoundDefinition } from '../definitions/abstract/FnDefinition.js';

/**
 * This class represents a registry for storing definitions overrides for scope.
 */
export class InstancesDefinitionsRegistry {
  static empty(): InstancesDefinitionsRegistry {
    return new InstancesDefinitionsRegistry({}, {});
  }

  static create(
    scopeOverrides: Array<AnyInstanceDefinition<any, any, any> | BoundDefinition<any, any, any>>,
    globalOverrides: Array<AnyInstanceDefinition<any, any, any> | BoundDefinition<any, any, any>>,
  ): InstancesDefinitionsRegistry {
    const registry = InstancesDefinitionsRegistry.empty();

    registry.addScopeOverrides(scopeOverrides);
    registry.addGlobalOverrides(globalOverrides);

    return registry;
  }

  constructor(
    private scopeOverrideDefinitionsById: Record<
      string,
      AnyInstanceDefinition<any, any, any> | BoundDefinition<any, any, any>
    >,
    private globalOverrideDefinitionsById: Record<
      string,
      AnyInstanceDefinition<any, any, any> | BoundDefinition<any, any, any>
    >,
  ) {}

  addScopeOverride(definition: AnyInstanceDefinition<any, any, any> | BoundDefinition<any, any, any>) {
    this.updateScopeOverride(definition);
  }

  checkoutForScope(
    scopeResolversOverrides: Array<AnyInstanceDefinition<any, any, any> | BoundDefinition<any, any, any>>,
  ) {
    const newRegistry = new InstancesDefinitionsRegistry(
      { ...this.scopeOverrideDefinitionsById },
      this.globalOverrideDefinitionsById,
    );
    newRegistry.addScopeOverrides(scopeResolversOverrides);
    return newRegistry;
  }

  getInstanceDefinition<T extends AnyInstanceDefinition<any, any, any> | IDefinition<any, any, any>>(
    instanceDefinition: T,
  ): T {
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

  private hasScopeOverrideResolver(resolverId: string): boolean {
    return !!this.scopeOverrideDefinitionsById[resolverId];
  }

  private updateScopeOverride(resolver: AnyInstanceDefinition<any, any, any> | BoundDefinition<any, any, any>) {
    this.scopeOverrideDefinitionsById[resolver.id] = resolver;
  }

  private addGlobalOverrideResolver(resolver: AnyInstanceDefinition<any, any, any> | BoundDefinition<any, any, any>) {
    if (this.globalOverrideDefinitionsById[resolver.id]) {
      throw new Error(`Invariant resolves cannot be updated after container creation`);
    }
    this.globalOverrideDefinitionsById[resolver.id] = resolver;
  }

  private addGlobalOverrides(patches: Array<AnyInstanceDefinition<any, any, any> | BoundDefinition<any, any, any>>) {
    patches.forEach(patchedResolver => {
      this.addGlobalOverrideResolver(patchedResolver);
    });
  }

  private addScopeOverrides(patches: Array<AnyInstanceDefinition<any, any, any> | BoundDefinition<any, any, any>>) {
    patches.forEach(patchedResolver => {
      this.updateScopeOverride(patchedResolver);
    });
  }
}
