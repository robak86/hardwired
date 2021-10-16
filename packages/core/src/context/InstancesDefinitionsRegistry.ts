import invariant from 'tiny-invariant';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition';

export class InstancesDefinitionsRegistry {
  static empty(): InstancesDefinitionsRegistry {
    return new InstancesDefinitionsRegistry({}, {});
  }

  static create(
    scopeOverrides: AnyInstanceDefinition<any, any, any>[],
    globalOverrides: AnyInstanceDefinition<any, any, any>[],
  ): InstancesDefinitionsRegistry {
    const registry = InstancesDefinitionsRegistry.empty();

    registry.addScopeOverrides(scopeOverrides);
    registry.addGlobalOverrides(globalOverrides);

    return registry;
  }

  constructor(
    private scopeOverrideDefinitionsById: Record<string, AnyInstanceDefinition<any, any>>,
    private globalOverrideDefinitionsById: Record<string, AnyInstanceDefinition<any, any>>,
  ) {}

  checkoutForRequestScope() {
    return this;
  }

  checkoutForScope(scopeResolversOverrides: AnyInstanceDefinition<any, any, any>[]) {
    const newRegistry = new InstancesDefinitionsRegistry(
      { ...this.scopeOverrideDefinitionsById },
      this.globalOverrideDefinitionsById,
    );
    newRegistry.addScopeOverrides(scopeResolversOverrides);
    return newRegistry;
  }

  getInstanceDefinition(instanceDefinition: AnyInstanceDefinition<any, any, any>): AnyInstanceDefinition<any, any, any> {
    const id = instanceDefinition.id;

    if (this.globalOverrideDefinitionsById[id]) {
      return this.globalOverrideDefinitionsById[id];
    }

    if (this.scopeOverrideDefinitionsById[id]) {
      return this.scopeOverrideDefinitionsById[id];
    }

    return instanceDefinition;
  }

  hasGlobalOverrideDefinition(resolverId: string): boolean {
    return !!this.globalOverrideDefinitionsById[resolverId];
  }

  private hasScopeOverrideResolver(resolverId: string): boolean {
    return !!this.scopeOverrideDefinitionsById[resolverId];
  }

  private addScopeOverrideResolver(resolver: AnyInstanceDefinition<any, any, any>) {
    this.scopeOverrideDefinitionsById[resolver.id] = resolver;
  }

  private addGlobalOverrideResolver(resolver: AnyInstanceDefinition<any, any, any>) {
    invariant(
      !this.globalOverrideDefinitionsById[resolver.id],
      `Invariant resolves cannot be updated after container creation`,
    );
    this.globalOverrideDefinitionsById[resolver.id] = resolver;
  }

  private addGlobalOverrides(patches: AnyInstanceDefinition<any, any, any>[]) {
    patches.forEach(patchedResolver => {
      this.addGlobalOverrideResolver(patchedResolver);
    });
  }

  private addScopeOverrides(patches: AnyInstanceDefinition<any, any, any>[]) {
    patches.forEach(patchedResolver => {
      this.addScopeOverrideResolver(patchedResolver);
    });
  }
}
