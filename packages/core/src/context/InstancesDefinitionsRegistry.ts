import invariant from 'tiny-invariant';
import { AnyInstanceDefinition } from '../definitions/AnyInstanceDefinition';

export class InstancesDefinitionsRegistry {
  static empty(): InstancesDefinitionsRegistry {
    return new InstancesDefinitionsRegistry({}, {});
  }

  static create(
    scopeOverrides: AnyInstanceDefinition<any, any>[],
    globalOverrides: AnyInstanceDefinition<any, any>[],
  ): InstancesDefinitionsRegistry {
    const registry = InstancesDefinitionsRegistry.empty();

    registry.addScopeOverrides(scopeOverrides);
    registry.addGlobalOverrides(globalOverrides);

    return registry;
  }

  constructor(
    private scopeOverrideResolversById: Record<string, AnyInstanceDefinition<any, any>>,
    private globalOverrideResolversById: Record<string, AnyInstanceDefinition<any, any>>,
  ) {}

  checkoutForRequestScope() {
    return this;
  }

  checkoutForScope(scopeResolversOverrides: AnyInstanceDefinition<any, any>[]) {
    const newRegistry = new InstancesDefinitionsRegistry(
      { ...this.scopeOverrideResolversById },
      this.globalOverrideResolversById,
    );
    newRegistry.addScopeOverrides(scopeResolversOverrides);
    return newRegistry;
  }

  getInstanceDefinition(instanceDefinition: AnyInstanceDefinition<any, any>): AnyInstanceDefinition<any, any> {
    const id = instanceDefinition.id;

    if (this.globalOverrideResolversById[id]) {
      return this.globalOverrideResolversById[id];
    }

    if (this.scopeOverrideResolversById[id]) {
      return this.scopeOverrideResolversById[id];
    }

    return instanceDefinition;
  }

  hasGlobalOverrideResolver(resolverId: string): boolean {
    return !!this.globalOverrideResolversById[resolverId];
  }

  private hasScopeOverrideResolver(resolverId: string): boolean {
    return !!this.scopeOverrideResolversById[resolverId];
  }

  private addScopeOverrideResolver(resolver: AnyInstanceDefinition<any, any>) {
    this.scopeOverrideResolversById[resolver.id] = resolver;
  }

  private addGlobalOverrideResolver(resolver: AnyInstanceDefinition<any, any>) {
    invariant(
      !this.globalOverrideResolversById[resolver.id],
      `Invariant resolves cannot be updated after container creation`,
    );
    this.globalOverrideResolversById[resolver.id] = resolver;
  }

  private addGlobalOverrides(patches: AnyInstanceDefinition<any, any>[]) {
    patches.forEach(patchedResolver => {
      this.addGlobalOverrideResolver(patchedResolver);
    });
  }

  private addScopeOverrides(patches: AnyInstanceDefinition<any, any>[]) {
    patches.forEach(patchedResolver => {
      this.addScopeOverrideResolver(patchedResolver);
    });
  }
}
